import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root='android-build/app/src/main';
const activity=fs.readFileSync(`${root}/java/com/spencerwilliams/nightsweep/MainActivity.java`,'utf8');
const bridge=fs.readFileSync(`${root}/java/com/spencerwilliams/nightsweep/MapScanBridge.java`,'utf8');
const policy=fs.readFileSync(`${root}/java/com/spencerwilliams/nightsweep/MapScanPolicy.java`,'utf8');
const manifest=fs.readFileSync(`${root}/AndroidManifest.xml`,'utf8');

test('optional scanner is native only and WebView remains offline',()=>{
 assert.match(manifest,/android\.permission\.INTERNET/);
 assert.match(manifest,/android:usesCleartextTraffic="false"/);
 assert.match(activity,/settings\.setBlockNetworkLoads\(true\)/);
 assert.match(activity,/new MapScanBridge\(this,web\)/);
 assert.match(activity,/@JavascriptInterface public void scanMap\(String id,String service,String token,String body\)/);
 assert.match(activity,/mapScanner\.close\(\)/);
 assert.match(bridge,/setInstanceFollowRedirects\(false\)/);
 assert.match(bridge,/setConnectTimeout\(20000\)/);
 assert.match(bridge,/setReadTimeout\(70000\)/);
 assert.match(bridge,/MapScanPolicy\.publicAddress\(address\)/);
 assert.match(bridge,/"\/v1\/map-scans"/);
 assert.match(bridge,/getPreferences\(0\).*"map-scanner-origin"/);
 assert.match(bridge,/activity\.isFinishing\(\) && activity\.isDestroyed\(\)|activity\.isFinishing\(\) \|\| activity\.isDestroyed\(\)/);
});

test('scanner origin and callback policy rejects local destinations and malformed IDs in Java',t=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'carpe-native-map-'));
 try{
  const checks=`public class NativeMapPolicyCheck {
   static void good(String value) throws Exception { MapScanPolicy.origin(value); }
   static void bad(String value) throws Exception { try { MapScanPolicy.origin(value); throw new AssertionError(value); } catch(IllegalArgumentException expected) {} }
   static void ip(String value,boolean expected) throws Exception { if(MapScanPolicy.publicAddress(InetAddress.getByName(value))!=expected)throw new AssertionError(value); }
   public static void main(String[] args) throws Exception {
    good("https://scan.example.org");good("https://SCAN.EXAMPLE.ORG:443/");
    for(String value:new String[]{"http://scan.example.org","https://localhost","https://scan.local","https://scan.internal","https://scan.example.org:444","https://127.0.0.1","https://[::1]","https://user@scan.example.org","https://scan.example.org/path","https://scan.example.org?x=1","https://-bad.example.org","https://bad-.example.org"})bad(value);
    if(!MapScanPolicy.callbackId("12345678-1234-1234-1234-123456789abc")||MapScanPolicy.callbackId("x');alert(1)//"))throw new AssertionError("callback ID");
    ip("8.8.8.8",true);ip("127.0.0.1",false);ip("10.0.0.1",false);ip("169.254.1.1",false);ip("100.64.0.1",false);ip("192.168.1.1",false);ip("::1",false);ip("fc00::1",false);
   }
  }`;
  const body=policy.replace(/^package [^;]+;\s*/,'').replace('public final class MapScanPolicy','final class MapScanPolicy');
  const imports=(body.match(/^import [^;]+;/gm)||[]).join('\n');
  const combined=imports+'\n'+checks+'\n'+body.replace(/^import [^;]+;/gm,'');
  const file=path.join(temp,'NativeMapPolicyCheck.java');fs.writeFileSync(file,combined);
  try { execFileSync(process.env.JAVA||'java',[file],{stdio:'pipe'}); }
  catch(error) { if(String(error.stderr).includes('release version 21 not supported'))t.skip('Java source compiler unavailable in this runtime'); else throw error; }
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
