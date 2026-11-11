package com.spencerwilliams.nightsweep;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ClipData;
import android.content.Intent;
import android.graphics.Color;
import android.database.Cursor;
import android.provider.OpenableColumns;
import android.net.Uri;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.os.ParcelFileDescriptor;
import android.print.PrintManager;
import android.print.PrintDocumentAdapter;
import android.print.PrintAttributes;
import android.print.PageRange;
import android.webkit.JavascriptInterface;
import android.webkit.JsResult;
import android.webkit.MimeTypeMap;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.LinkedHashSet;
import java.util.ArrayList;
import java.util.UUID;
import java.util.Locale;
import org.json.JSONObject;

/** Offline app: the only rendered document comes from the packaged asset. */
public final class MainActivity extends Activity {
    private static final String ORIGIN = "https://appassets.androidplatform.net/";
    private static final int OPEN_FILE = 41, SAVE_FILE = 42;
    private static final int MAX_EXPORT = 20 * 1024 * 1024;
    private static final int MAX_BINARY_EXPORT = 8 * 1024 * 1024;
    private static final int MAX_PICKED_FILES = 30;
    private static final int MAX_PICKED_TOTAL = 24 * 1024 * 1024;
    private static final int MAX_BINARY_BASE64 = 4 * ((MAX_BINARY_EXPORT + 2) / 3);
    private WebView web;
    private ValueCallback<Uri[]> fileCallback;
    private byte[] pendingExport;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        if(state!=null && state.getBoolean("documentOperationPending",false)) {
            Toast.makeText(this,"Android restarted Carpe Noctum while a document picker was open. Please repeat that import or export.",Toast.LENGTH_LONG).show();
        }
        // Import URIs only point at our private byte copies, never the original provider.
        PickerFiles.prune(this);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(7,16,20));
        web = new WebView(this);
        web.setBackgroundColor(Color.rgb(7,16,20));
        root.addView(web,new FrameLayout.LayoutParams(-1,-1));
        setContentView(root);
        root.setOnApplyWindowInsetsListener((view,insets) -> {
            view.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());
            return insets.consumeSystemWindowInsets();
        });
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true); // Only user-selected documents from the system picker.
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setBlockNetworkLoads(true);
        settings.setSupportMultipleWindows(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        WebView.setWebContentsDebuggingEnabled(false);
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return new WebResourceResponse("text/plain","UTF-8",new ByteArrayInputStream(new byte[0]));
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                // All navigation out of the packaged document is blocked in this WebView.
                if (request.hasGesture() && request.isForMainFrame() && "https".equals(uri.getScheme()) && !"appassets.androidplatform.net".equals(uri.getHost())) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW,uri)); }
                    catch (Exception e) { status("No browser is available for this source link."); }
                }
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onJsAlert(WebView view,String url,String message,JsResult result) {
                new AlertDialog.Builder(MainActivity.this).setTitle("Carpe Noctum 2.0 Alpha build 3").setMessage(message).setPositiveButton("OK",(d,w)->result.confirm()).setOnCancelListener(d->result.cancel()).show(); return true;
            }
            @Override public boolean onJsConfirm(WebView view,String url,String message,JsResult result) {
                new AlertDialog.Builder(MainActivity.this).setTitle("Carpe Noctum 2.0 Alpha build 3").setMessage(message).setPositiveButton("Continue",(d,w)->result.confirm()).setNegativeButton("Cancel",(d,w)->result.cancel()).setOnCancelListener(d->result.cancel()).show(); return true;
            }
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,FileChooserParams params) {
                if (fileCallback!=null || pendingExport!=null) {
                    callback.onReceiveValue(null); status("Finish the current file picker before opening another."); return true;
                }
                fileCallback=callback;
                Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("*/*");
                String[] types=acceptedMimeTypes(params.getAcceptTypes());
                if(types.length==1)intent.setType(types[0]);
                else if(types.length>1)intent.putExtra(Intent.EXTRA_MIME_TYPES,types);
                intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE,params.getMode()==FileChooserParams.MODE_OPEN_MULTIPLE);
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                try { startActivityForResult(intent,OPEN_FILE); }
                catch (Exception e) { finishFileCallback(null); status("A document picker is not available."); }
                return true;
            }
        });
        web.addJavascriptInterface(new NativeBridge(),"NightSweepAndroid");
        try (InputStream input=getAssets().open("index.html")) {
            ByteArrayOutputStream output=new ByteArrayOutputStream(); byte[] buffer=new byte[8192]; int n;
            while((n=input.read(buffer))!=-1) output.write(buffer,0,n);
            web.loadDataWithBaseURL(ORIGIN,output.toString("UTF-8"),"text/html",null,ORIGIN);
        } catch(Exception e) {
            new AlertDialog.Builder(this).setTitle("Unable to open Carpe Noctum").setMessage("The offline app content could not be loaded. Reinstall the APK.").setPositiveButton("Close",(d,w)->finish()).show();
        }
    }

    // An empty or unknown accept extension must not hide proprietary meter files.
    private static String[] acceptedMimeTypes(String[] accepted) {
        LinkedHashSet<String> types=new LinkedHashSet<>();
        if(accepted==null)return new String[0];
        for(String group:accepted) {
            if(group==null)continue;
            for(String raw:group.split(",")) {
                String value=raw.trim().toLowerCase(Locale.ROOT);
                if(value.isEmpty())continue;
                if("*/*".equals(value))return new String[0];
                if(value.startsWith(".")) {
                    String extension=value.substring(1);
                    value=MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension);
                    if("json".equals(extension))value="application/json";
                    else if("csv".equals(extension))value="text/csv";
                    else if("xml".equals(extension))value="application/xml";
                    else if("zip".equals(extension))value="application/zip";
                    if(value==null)return new String[0];
                }
                if(!value.matches("[a-z0-9!#$&^_.+-]+/[a-z0-9!#$&^_.+*-]+"))return new String[0];
                types.add(value);
            }
        }
        return types.toArray(new String[0]);
    }

    private static String exportName(String name,String fallback) {
        String safe=(name==null?fallback:name).replaceAll("[^A-Za-z0-9._-]","_");
        if(safe.isEmpty() || ".".equals(safe) || "..".equals(safe))safe=fallback;
        if(safe.length()>180) {
            int dot=safe.lastIndexOf('.');
            String extension=dot>0 && safe.length()-dot<=20?safe.substring(dot):"";
            safe=safe.substring(0,180-extension.length())+extension;
        }
        return safe;
    }

    private static String binaryMime(String mime) {
        if(mime==null)return "application/octet-stream";
        switch(mime.toLowerCase(Locale.ROOT)) {
            case "application/json": case "application/pdf": case "application/zip":
            case "application/xml": case "text/xml": case "text/plain": case "text/csv":
            case "image/png": case "image/jpeg": case "image/webp": case "image/gif":
                return mime.toLowerCase(Locale.ROOT);
            default:return "application/octet-stream";
        }
    }

    private static byte[] decodeEvidence(String base64) {
        if(base64==null || base64.length()>MAX_BINARY_BASE64)throw new IllegalArgumentException("Evidence export exceeds the 8 MiB file limit.");
        final byte[] bytes;
        try{bytes=Base64.getDecoder().decode(base64);}
        catch(IllegalArgumentException e){throw new IllegalArgumentException("The evidence file encoding is invalid.");}
        if(bytes.length>MAX_BINARY_EXPORT)throw new IllegalArgumentException("Evidence export exceeds the 8 MiB file limit.");
        return bytes;
    }

    private void startExport(String name,byte[] bytes,String mime) {
        runOnUiThread(()-> {
            if(pendingExport!=null || fileCallback!=null){status("Finish the current file picker before exporting again.");return;}
            pendingExport=bytes;
            Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType(mime).putExtra(Intent.EXTRA_TITLE,name);
            try{startActivityForResult(intent,SAVE_FILE);}catch(Exception e){pendingExport=null;status("A document picker is not available.");}
        });
    }

    private void status(String message) {
        runOnUiThread(()-> {
            Toast.makeText(MainActivity.this,message,Toast.LENGTH_LONG).show();
            if(web!=null) web.evaluateJavascript("if(window.NightSweep&&NightSweep.onNativeStatus)NightSweep.onNativeStatus("+JSONObject.quote(message)+");",null);
        });
    }
    public final class NativeBridge {
        @JavascriptInterface public void saveFile(String name,String text,String mime) {
            if(text==null || text.length()>MAX_EXPORT) {status("Export is empty or exceeds the 20 MB limit.");return;}
            final byte[] bytes=text.getBytes(StandardCharsets.UTF_8);
            if(bytes.length>MAX_EXPORT){status("Export exceeds the 20 MB limit.");return;}
            final String safeMime="text/csv".equals(mime)?"text/csv":"text/plain".equals(mime)?"text/plain":"application/json";
            startExport(exportName(name,"CarpeNoctum-export.json"),bytes,safeMime);
        }
        @JavascriptInterface public void saveBinary(String name,String base64,String mime) {
            final byte[] bytes;
            try{bytes=decodeEvidence(base64);}
            catch(IllegalArgumentException e){status(e.getMessage());return;}
            startExport(exportName(name,"CarpeNoctum-evidence.bin"),bytes,binaryMime(mime));
        }
        @JavascriptInterface public void shareText(String title,String text) {
            if(text==null || text.length()>1024*1024){status("The run sheet is empty or too large to share.");return;}
            final String subject=title==null?"Carpe Noctum 2.0 Alpha build 3 run sheet":title.substring(0,Math.min(title.length(),200));
            runOnUiThread(()-> {
                Intent intent=new Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_SUBJECT,subject).putExtra(Intent.EXTRA_TEXT,text);
                try{startActivity(Intent.createChooser(intent,"Share run sheet"));}
                catch(Exception e){status("Sharing is not available. Save the run sheet from Files instead.");}
            });
        }
        @JavascriptInterface public void printReport() {
            runOnUiThread(()-> {
                final WebView view=web;
                if(view==null || isFinishing() || isDestroyed())return;
                view.evaluateJavascript("(function(){try{if(window.NightSweep&&NightSweep.preparePrint)NightSweep.preparePrint();return true;}catch(e){return false;}})()", result -> {
                    if(web!=view || isFinishing() || isDestroyed())return;
                    if (!"true".equals(result)) {restorePrint();status("The print report could not be prepared.");return;}
                    try {
                        final PrintDocumentAdapter delegate=view.createPrintDocumentAdapter("Carpe Noctum 2.0 Alpha build 3 field report");
                        PrintDocumentAdapter adapter=new PrintDocumentAdapter() {
                            @Override public void onStart(){delegate.onStart();}
                            @Override public void onLayout(PrintAttributes oldAttributes,PrintAttributes newAttributes,CancellationSignal signal,LayoutResultCallback callback,Bundle extras){delegate.onLayout(oldAttributes,newAttributes,signal,callback,extras);}
                            @Override public void onWrite(PageRange[] pages,ParcelFileDescriptor destination,CancellationSignal signal,WriteResultCallback callback){delegate.onWrite(pages,destination,signal,callback);}
                            @Override public void onFinish(){delegate.onFinish();restorePrint();}
                        };
                        PrintManager manager=(PrintManager)getSystemService(PRINT_SERVICE);
                        manager.print("Carpe Noctum 2.0 Alpha build 3 field report",adapter,null);
                    } catch(Exception e) {restorePrint();status("Printing is not available on this device.");}
                });
            });
        }
    }
    private void restorePrint() {
        runOnUiThread(()-> {if(web!=null)web.evaluateJavascript("if(window.NightSweep&&NightSweep.restorePrint)NightSweep.restorePrint();",null);});
    }
    @Override protected void onActivityResult(int request,int result,Intent data) {
        super.onActivityResult(request,result,data);
        if(request==OPEN_FILE && fileCallback!=null) {
            final ValueCallback<Uri[]> callback=fileCallback;
            LinkedHashSet<Uri> selected=new LinkedHashSet<>();
            boolean invalid=false;
            if(result==RESULT_OK && data!=null) {
                ClipData clips=data.getClipData();
                if(clips!=null)for(int i=0;i<clips.getItemCount();i++) {
                    Uri uri=clips.getItemAt(i).getUri();
                    if(uri==null || !"content".equals(uri.getScheme()))invalid=true;
                    else selected.add(uri);
                }
                if(data.getData()!=null) {
                    Uri uri=data.getData();
                    if(!"content".equals(uri.getScheme()))invalid=true;
                    else selected.add(uri);
                }
            }
            if(invalid){finishFileCallback(null);status("The picker returned an unreadable document. Choose files from Android Files.");}
            else if(selected.isEmpty())finishFileCallback(null);
            else if(selected.size()>MAX_PICKED_FILES){finishFileCallback(null);status("Choose at most 30 files at once.");}
            else {
                final Uri[] originals=selected.toArray(new Uri[0]);
                // Do not give WebView a transient URI-only reference. Copy while the picker grant
                // is held, then return only private, read-only app provider URIs.
                new Thread(()-> {
                    final ArrayList<Uri> copied=new ArrayList<>();
                    try {
                        long total=0;
                        for(Uri original:originals) {
                            Uri local=copyPickedDocument(original,MAX_PICKED_TOTAL-total);
                            copied.add(local);total+=PickerFiles.fileFor(MainActivity.this,local).length();
                        }
                        runOnUiThread(()-> {
                            if(fileCallback==callback && web!=null)finishFileCallback(copied.toArray(new Uri[0]));
                            else for(Uri uri:copied)PickerFiles.delete(MainActivity.this,uri);
                        });
                    }catch(Exception e) {
                        for(Uri uri:copied)PickerFiles.delete(MainActivity.this,uri);
                        runOnUiThread(()-> {
                            if(fileCallback==callback){finishFileCallback(null);status("Could not copy the selected files. Each file must be at most 20 MiB; selection total at most 24 MiB. Try another source.");}
                        });
                    }
                }).start();
            }
        } else if(request==SAVE_FILE) {
            final byte[] bytes=pendingExport; pendingExport=null;
            if(result!=RESULT_OK || data==null || data.getData()==null || bytes==null) return;
            final Uri uri=data.getData();
            new Thread(()-> {
                try(OutputStream output=getContentResolver().openOutputStream(uri,"wt")) {
                    if(output==null) throw new IllegalStateException("No document stream");
                    output.write(bytes);output.flush();status("File saved.");
                }catch(Exception e){status("The file could not be saved. Try another folder.");}
            }).start();
        }
    }
    private void finishFileCallback(Uri[] value) {
        ValueCallback<Uri[]> callback=fileCallback;
        fileCallback=null; // Clear once before invoking; cancellation is always null.
        if(callback!=null)callback.onReceiveValue(value);
    }

    private Uri copyPickedDocument(Uri original,long remaining) throws IOException {
        String display="document.bin";
        try(Cursor cursor=getContentResolver().query(original,new String[]{OpenableColumns.DISPLAY_NAME},null,null,null)) {
            if(cursor!=null && cursor.moveToFirst()) {
                String value=cursor.getString(0);if(value!=null && !value.isEmpty())display=value;
            }
        }catch(Exception ignored) { /* Some providers do not expose display names. */ }
        String safe=display.replaceAll("[\\p{Cntrl}/\\\\]","_");
        if(safe.isEmpty() || ".".equals(safe) || "..".equals(safe))safe="document.bin";
        // Cache filenames are byte-limited; a short Unicode name can exceed that limit.
        if(safe.getBytes(StandardCharsets.UTF_8).length>180)safe=exportName(safe,"document.bin");
        String token=UUID.randomUUID().toString().replace("-","");
        File directory=new File(new File(getCacheDir(),"picker-imports"),token);
        if(!directory.mkdirs())throw new IOException("Unable to create app import folder");
        File copy=new File(directory,safe);
        boolean complete=false;
        try(InputStream input=getContentResolver().openInputStream(original);OutputStream output=new FileOutputStream(copy)) {
            if(input==null)throw new IOException("No source stream");
            byte[] buffer=new byte[8192];int count;long size=0;
            while((count=input.read(buffer))!=-1) {
                size+=count;
                if(size>MAX_EXPORT || size>remaining)throw new IOException("Import too large");
                output.write(buffer,0,count);
            }
            output.flush();complete=true;
        }finally {if(!complete){copy.delete();directory.delete();}}
        return new Uri.Builder().scheme("content").authority(getPackageName()+".pickerfiles").appendPath(token).appendPath(safe).build();
    }

    @Override public void onBackPressed() {
        new AlertDialog.Builder(this).setTitle("Close Carpe Noctum?").setMessage("Saved projects stay on this device.").setPositiveButton("Close",(d,w)->finish()).setNegativeButton("Stay",null).show();
    }
    @Override protected void onSaveInstanceState(Bundle state) {
        state.putBoolean("documentOperationPending",pendingExport!=null || fileCallback!=null);
        super.onSaveInstanceState(state);
    }
    @Override protected void onDestroy() {
        finishFileCallback(null);
        if(web!=null){web.removeJavascriptInterface("NightSweepAndroid");web.destroy();web=null;}
        super.onDestroy();
    }
}
