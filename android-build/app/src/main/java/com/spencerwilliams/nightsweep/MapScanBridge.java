package com.spencerwilliams.nightsweep;

import android.app.Activity;
import android.app.AlertDialog;
import android.webkit.WebView;
import java.net.InetAddress;
import java.net.URL;
import javax.net.ssl.HttpsURLConnection;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Iterator;
import java.util.concurrent.Executors;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.atomic.AtomicBoolean;
import org.json.JSONObject;

/** Only the explicitly trusted scanner origin can receive a reviewed PNG request. */
public final class MapScanBridge {
    private final Activity activity;
    private final WebView web;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final AtomicBoolean busy = new AtomicBoolean(false);
    private volatile boolean closed;
    private volatile HttpsURLConnection connection;
    public MapScanBridge(Activity activity, WebView web) { this.activity=activity; this.web=web; }

    public void scan(String id, String service, String token, String body) {
        if (!MapScanPolicy.callbackId(id) || closed) return;
        final String origin;
        try {
            origin=MapScanPolicy.origin(service);
            if(token==null || !token.matches("[A-Za-z0-9_-]{32,256}") || body==null || body.length()>7*1024*1024 || body.getBytes(StandardCharsets.UTF_8).length>7*1024*1024) throw new Exception();
            JSONObject request=new JSONObject(body);
            String stage=request.getString("stage");
            for(Iterator<String> it=request.keys();it.hasNext();) {
                String key=it.next();
                if(!java.util.Arrays.asList("version","stage","image","width","height","revision","findings").contains(key))throw new Exception();
            }
            if(request.length()!=("crosscheck".equals(stage)?7:6) || request.getInt("version")!=1 || !"initial".equals(stage) && !"crosscheck".equals(stage))throw new Exception();
            int width=request.getInt("width"),height=request.getInt("height");
            if(width<1 || width>2048 || height<1 || height>2048 || !request.getString("revision").matches("[A-Za-z0-9_-]{1,100}"))throw new Exception();
            String image=request.getString("image");
            if(!image.matches("data:image/png;base64,[A-Za-z0-9+/]+={0,2}"))throw new Exception();
            byte[] png=Base64.getDecoder().decode(image.substring("data:image/png;base64,".length()));
            if(png.length<45 || png[0]!=(byte)137 || png[1]!=80 || png[2]!=78 || png[3]!=71 || png[4]!=13 || png[5]!=10 || png[6]!=26 || png[7]!=10 ||
               png[8]!=0 || png[9]!=0 || png[10]!=0 || png[11]!=13 ||
               png[12]!=73 || png[13]!=72 || png[14]!=68 || png[15]!=82 ||
               png[16]!=(byte)(width>>>24) || png[17]!=(byte)(width>>>16) || png[18]!=(byte)(width>>>8) || png[19]!=(byte)width ||
               png[20]!=(byte)(height>>>24) || png[21]!=(byte)(height>>>16) || png[22]!=(byte)(height>>>8) || png[23]!=(byte)height ||
               png[png.length-8]!=73 || png[png.length-7]!=69 || png[png.length-6]!=78 || png[png.length-5]!=68)throw new Exception();
            if("crosscheck".equals(stage) && !(request.get("findings") instanceof JSONObject))throw new Exception();
        } catch(Exception e) { deliver(id,false,""); return; }
        if(!busy.compareAndSet(false,true)){deliver(id,false,"");return;}
        activity.runOnUiThread(()->{
            if(closed || activity.isFinishing() || activity.isDestroyed()){busy.set(false);return;}
            String trusted=activity.getPreferences(0).getString("map-scanner-origin","");
            if(origin.equals(trusted)){run(id,origin,token,body);return;}
            new AlertDialog.Builder(activity).setTitle("Trust map scanner?")
                .setMessage("Send only your reviewed masked preview to "+origin+"? It uses OpenAI and Gemini. Original PDF files are not sent.")
                .setPositiveButton("Trust service",(dialog,which)->{activity.getPreferences(0).edit().putString("map-scanner-origin",origin).apply();run(id,origin,token,body);})
                .setNegativeButton("Cancel",(dialog,which)->{busy.set(false);deliver(id,false,"");})
                .setOnCancelListener(dialog->{busy.set(false);deliver(id,false,"");}).show();
        });
    }
    private void run(String id,String origin,String token,String body) {
        if(closed){busy.set(false);return;}
        executor.execute(()->{
            HttpsURLConnection conn=null;
            try {
                URL url=new URL(origin+"/v1/map-scans");
                for(InetAddress address:InetAddress.getAllByName(url.getHost()))if(!MapScanPolicy.publicAddress(address))throw new Exception();
                byte[] bytes=body.getBytes(StandardCharsets.UTF_8);if(bytes.length>7*1024*1024)throw new Exception();
                conn=(HttpsURLConnection)url.openConnection();connection=conn;
                conn.setInstanceFollowRedirects(false);conn.setConnectTimeout(20000);conn.setReadTimeout(70000);
                conn.setRequestMethod("POST");conn.setDoOutput(true);
                conn.setRequestProperty("Content-Type","application/json");conn.setRequestProperty("Accept","application/json");conn.setRequestProperty("Authorization","Bearer "+token);
                conn.setRequestProperty("Origin","https://appassets.androidplatform.net");conn.setRequestProperty("Cache-Control","no-store");
                conn.setFixedLengthStreamingMode(bytes.length);
                try(java.io.OutputStream out=conn.getOutputStream()){out.write(bytes);}
                if(conn.getResponseCode()!=200)throw new Exception();
                String responseType=conn.getContentType();
                if(responseType==null || !responseType.toLowerCase(java.util.Locale.ROOT).matches("application/json(?:\\s*;.*)?"))throw new Exception();
                ByteArrayOutputStream result=new ByteArrayOutputStream();
                try(InputStream input=conn.getInputStream()){
                    byte[] buffer=new byte[8192];int n;
                    while((n=input.read(buffer))!=-1){if(closed || result.size()+n>1024*1024)throw new Exception();result.write(buffer,0,n);}
                }
                deliver(id,true,new String(result.toByteArray(),StandardCharsets.UTF_8));
            } catch(Exception e){deliver(id,false,"");}
            finally{if(conn!=null)conn.disconnect();connection=null;busy.set(false);}
        });
    }
    private void deliver(String id,boolean ok,String text){
        if(closed)return;
        activity.runOnUiThread(()->{if(!closed && !activity.isFinishing() && !activity.isDestroyed())web.evaluateJavascript(
            "if(window.MapNativeCallbacks&&MapNativeCallbacks["+JSONObject.quote(id)+"])MapNativeCallbacks["+JSONObject.quote(id)+"]("+ok+","+JSONObject.quote(text)+");",null);});
    }
    public void close(){closed=true;HttpsURLConnection c=connection;if(c!=null)c.disconnect();executor.shutdownNow();}
}
