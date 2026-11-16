import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

test('native initial completion releases transport before a callback immediately requests crosscheck',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'carpe-completion-'));
 try {
  const base='android-build/app/src/main/java/com/spencerwilliams/nightsweep/';
  const bridge=fs.readFileSync(base+'MapScanBridge.java','utf8').replace(/^package [^;]+;/m,'').replace(/^import [^;]+;/gm,'').replace('public final class MapScanBridge','final class MapScanBridge');
  const policy=fs.readFileSync(base+'MapScanPolicy.java','utf8').replace(/^package [^;]+;/m,'').replace(/^import [^;]+;/gm,'').replace('public final class MapScanPolicy','final class MapScanPolicy');
  const source=`import java.net.*;import java.io.*;import java.util.*;import java.util.concurrent.*;import java.util.concurrent.atomic.*;import java.nio.charset.StandardCharsets;import javax.net.ssl.*;
public class NativeCompletionCheck {
 static final String ID="12345678-1234-4234-8234-123456789abc";
 static final List<Boolean> results=new CopyOnWriteArrayList<>();static final CountDownLatch done=new CountDownLatch(2);static volatile boolean disconnected;
 static MapScanBridge scanner;
 public static void main(String[] args)throws Exception {
  URL.setURLStreamHandlerFactory(protocol->protocol.equals("https")?new URLStreamHandler(){protected URLConnection openConnection(URL url){disconnected=false;return new FakeConnection(url);}}:null);
  WebView web=new WebView();scanner=new MapScanBridge(new Activity(),web);scanner.scan(ID,"https://example.com","a".repeat(32),"{}");
  try { if(!done.await(5,TimeUnit.SECONDS))throw new AssertionError("Two stages did not finish: "+results); } finally {scanner.close();}
  if(!results.equals(Arrays.asList(true,true)))throw new AssertionError("Crosscheck rejected or completion published before disconnect: "+results);
 }
 static class FakeConnection extends HttpsURLConnection {
  FakeConnection(URL u){super(u);}public void connect(){}public boolean usingProxy(){return false;}public void disconnect(){disconnected=true;}public String getCipherSuite(){return "TLS";}public java.security.cert.Certificate[] getLocalCertificates(){return null;}public java.security.cert.Certificate[] getServerCertificates(){return null;}
  public OutputStream getOutputStream(){return new ByteArrayOutputStream();}public int getResponseCode(){return 200;}public String getContentType(){return "application/json";}public InputStream getInputStream(){return new ByteArrayInputStream("{}".getBytes(StandardCharsets.UTF_8));}
 }
}
class Activity {void runOnUiThread(Runnable r){r.run();}boolean isFinishing(){return false;}boolean isDestroyed(){return false;}Preferences getPreferences(int mode){return new Preferences();}}
class Preferences {String getString(String key,String fallback){return "https://example.com";}Preferences edit(){return this;}Preferences putString(String k,String v){return this;}void apply(){}}
class WebView {void evaluateJavascript(String js,Object callback){boolean ok=js.contains("](true,");NativeCompletionCheck.results.add(ok&&NativeCompletionCheck.disconnected);NativeCompletionCheck.done.countDown();if(NativeCompletionCheck.results.size()==1)NativeCompletionCheck.scanner.scan(NativeCompletionCheck.ID,"https://example.com","a".repeat(32),"{}");}}
interface DialogAction {void run(Object dialog,int which);}interface CancelAction {void run(Object dialog);}
class AlertDialog {static class Builder {Builder(Activity a){}Builder setTitle(String s){return this;}Builder setMessage(String s){return this;}Builder setPositiveButton(String s,DialogAction r){return this;}Builder setNegativeButton(String s,DialogAction r){return this;}Builder setOnCancelListener(CancelAction r){return this;}void show(){throw new AssertionError("Trusted fixture must not prompt");}}}
// Protocol parsing is covered by separate tests. This fixture supplies a valid parsed request
// so the actual production bridge executor/callback ordering can run without Android SDK.
class JSONObject {final Map<String,Object> fields=new LinkedHashMap<>();JSONObject(String text){byte[] png=new byte[45];byte[] sig={(byte)137,80,78,71,13,10,26,10};System.arraycopy(sig,0,png,0,8);png[11]=13;png[12]=73;png[13]=72;png[14]=68;png[15]=82;png[19]=1;png[23]=1;png[37]=73;png[38]=69;png[39]=78;png[40]=68;fields.put("version",1);fields.put("stage","initial");fields.put("width",1);fields.put("height",1);fields.put("revision","test");fields.put("image","data:image/png;base64,"+Base64.getEncoder().encodeToString(png));}Iterator<String> keys(){return fields.keySet().iterator();}int length(){return fields.size();}String getString(String k){return (String)fields.get(k);}int getInt(String k){return (Integer)fields.get(k);}Object get(String k){return fields.get(k);}static String quote(String s){return "\\\""+s+"\\\"";}}
`+bridge+'\n'+policy;
  const file=path.join(dir,'NativeCompletionCheck.java');fs.writeFileSync(file,source);
  const hosts=path.join(dir,'hosts');fs.writeFileSync(hosts,'8.8.8.8 example.com\n');
  const result=execFileSync(process.env.JAVA||'java',['-Djdk.net.hosts.file='+hosts,file],{encoding:'utf8',timeout:15000});assert.equal(result,'');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
