#!/usr/bin/env python3
"""Execute production filename/print Java bodies with filesystem and UI queue stand-ins.

Requires Java 21 with its source launcher/compiler. This is not an Android device test.
"""
from pathlib import Path
from tempfile import TemporaryDirectory
import base64
import re
import subprocess
import sys
import unittest

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'android-build/app/src/main/java/com/spencerwilliams/nightsweep/MainActivity.java'


def execute_production_bodies():
    source = SOURCE.read_text()
    export = re.search(r'    private static String exportName\(.*?\n    \}', source, re.S).group(0)
    sanitizer = re.search(r'        String safe=display\.replaceAll\(.*?(?=\n        String token=)', source, re.S).group(0)
    printer = re.search(r'        @JavascriptInterface public void printReport\(\) \{.*?\n        \}', source, re.S).group(0).replace('@JavascriptInterface ', '')
    # Only platform boundaries are stand-ins; branches/guards/sanitization are production Java.
    code = r'''import java.nio.file.*;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.function.Consumer;
public class NativeEdgeChecks {
''' + export + r'''
 static String importName(String display){
''' + sanitizer + r'''
  return safe;
 }
 static void filename(String label,String display)throws Exception{
  String safe=importName(display);Path folder=Files.createTempDirectory("nightsweep-native-filename-");boolean written=false;
  try{Files.write(folder.resolve(safe),new byte[]{1});written=true;Files.delete(folder.resolve(safe));}
  catch(java.io.IOException ignored){}finally{Files.delete(folder);}
  System.out.println(label+"="+Base64.getEncoder().encodeToString(safe.getBytes(StandardCharsets.UTF_8))+"|"+safe.getBytes(StandardCharsets.UTF_8).length+"|"+written);
 }
 Runnable ui;WebView web=new WebView();boolean finishing,destroyed,defer;int evaluations,jobs,statuses,restores;Consumer<String> callback;
 boolean isFinishing(){return finishing;}boolean isDestroyed(){return destroyed;}
 void runOnUiThread(Runnable task){ui=task;}void restorePrint(){restores++;}void status(String message){statuses++;}
 static final String PRINT_SERVICE="print";Object getSystemService(String name){return new PrintManager();}
 class NativeBridge {
''' + printer + r'''
 }
 class WebView {
  void evaluateJavascript(String text,Consumer<String> result){evaluations++;if(defer)callback=result;else result.accept("true");}
  PrintDocumentAdapter createPrintDocumentAdapter(String name){return new PrintDocumentAdapter();}
 }
 class PrintManager{void print(String title,PrintDocumentAdapter adapter,Object options){jobs++;}}
 static class PrintDocumentAdapter {
  static class LayoutResultCallback{}static class WriteResultCallback{}
  void onStart(){}void onFinish(){}
  void onLayout(PrintAttributes a,PrintAttributes b,CancellationSignal s,LayoutResultCallback c,Bundle e){}
  void onWrite(PageRange[] p,ParcelFileDescriptor d,CancellationSignal s,WriteResultCallback c){}
 }
 static class PrintAttributes{}static class CancellationSignal{}static class Bundle{}static class PageRange{}static class ParcelFileDescriptor{}
 static void printcase(String name)throws Exception{
  NativeEdgeChecks h=new NativeEdgeChecks();h.defer=name.startsWith("callback_");h.new NativeBridge().printReport();
  if(name.equals("queued_null")){h.web=null;h.destroyed=true;}
  if(name.equals("queued_finishing"))h.finishing=true;
  if(name.equals("queued_destroyed"))h.destroyed=true;
  String error="none";
  try{
   h.ui.run();
   if(name.equals("callback_destroyed")){h.web=null;h.destroyed=true;}
   if(name.equals("callback_finishing"))h.finishing=true;
   if(name.equals("callback_replaced"))h.web=h.new WebView();
   if(h.callback!=null)h.callback.accept(name.equals("callback_rejected")?"false":"true");
  }catch(RuntimeException failure){error=failure.getClass().getSimpleName();}
  System.out.println(name+"="+error+"|"+h.evaluations+"|"+h.jobs+"|"+h.statuses+"|"+h.restores);
 }
 public static void main(String[] args)throws Exception{
  filename("cjk_long","測".repeat(100)+".csv");filename("emoji_long","🚀".repeat(70)+".csv");
  filename("cjk_short","測".repeat(50)+".csv");filename("ascii_long","a".repeat(210)+".csv");
  filename("unsafe","../a\u0001.csv");filename("empty","");
  for(String name:new String[]{"queued_null","queued_finishing","queued_destroyed","callback_destroyed","callback_finishing","callback_replaced","live","callback_rejected"})printcase(name);
 }
}
'''
    with TemporaryDirectory(prefix='nightsweep-native-java-') as temporary:
        path = Path(temporary) / 'NativeEdgeChecks.java'
        path.write_text(code)
        result = subprocess.run(['java', str(path)], text=True, capture_output=True, check=True)
    return dict(line.split('=', 1) for line in result.stdout.strip().splitlines())


class NativeEdgeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.results = execute_production_bodies()

    def filename(self, name):
        encoded, size, created = self.results[name].split('|')
        return base64.b64decode(encoded).decode(), int(size), created == 'true'

    def test_long_cjk_name_can_be_copied_to_private_cache(self):
        name, size, created = self.filename('cjk_long')
        self.assertTrue(created)
        self.assertLessEqual(size, 180)
        self.assertTrue(name.endswith('.csv'))

    def test_long_emoji_name_can_be_copied_to_private_cache(self):
        name, size, created = self.filename('emoji_long')
        self.assertTrue(created)
        self.assertLessEqual(size, 180)
        self.assertTrue(name.endswith('.csv'))

    def test_short_unicode_name_stays_readable(self):
        name, size, created = self.filename('cjk_short')
        self.assertEqual(name, '測' * 50 + '.csv')
        self.assertEqual(size, 154)
        self.assertTrue(created)

    def test_long_ascii_name_keeps_extension_within_limit(self):
        name, size, created = self.filename('ascii_long')
        self.assertEqual(size, 180)
        self.assertTrue(name.endswith('.csv'))
        self.assertTrue(created)

    def test_unsafe_or_empty_names_do_not_escape_private_folder(self):
        name, _, created = self.filename('unsafe')
        self.assertNotIn('/', name)
        self.assertNotIn('\x01', name)
        self.assertTrue(created)
        self.assertEqual(self.filename('empty'), ('document.bin', 12, True))

    def assert_closed_print_stops(self, case, evaluations):
        self.assertEqual(self.results[case], 'none|' + str(evaluations) + '|0|0|0')

    def test_queued_print_after_webview_destroy_is_ignored(self):
        self.assert_closed_print_stops('queued_null', 0)

    def test_queued_print_after_activity_finishes_is_ignored(self):
        self.assert_closed_print_stops('queued_finishing', 0)

    def test_queued_print_after_activity_is_destroyed_is_ignored(self):
        self.assert_closed_print_stops('queued_destroyed', 0)

    def test_callback_after_activity_destroy_is_ignored(self):
        self.assert_closed_print_stops('callback_destroyed', 1)

    def test_callback_after_activity_finishes_is_ignored(self):
        self.assert_closed_print_stops('callback_finishing', 1)

    def test_callback_for_replaced_webview_is_ignored(self):
        self.assert_closed_print_stops('callback_replaced', 1)

    def test_live_print_and_preparation_failure_remain_supported(self):
        self.assertEqual(self.results['live'], 'none|1|1|0|0')
        self.assertEqual(self.results['callback_rejected'], 'none|1|0|1|1')


if __name__ == '__main__':
    result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(NativeEdgeTests))
    if result.wasSuccessful():
        print('Android native edges: ' + str(result.testsRun) + ' checks passed (Java bodies; no device verification)')
    sys.exit(not result.wasSuccessful())
