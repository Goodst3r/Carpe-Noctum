import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

test('Android preview permits local inline resources and refuses network schemes', t => {
 const java='/usr/lib/jvm/default-java/bin/java';
 const compiler=process.env.CARPE_ECJ || '/workspace/scratch/carpe-android-toolchain/ecj.jar';
 const source=fs.readFileSync('android-build/app/src/main/java/com/spencerwilliams/nightsweep/MainActivity.java','utf8');
 const helper=source.match(/static boolean loadsInline\(String scheme\)\s*\{[^}]+\}/)?.[0];
 assert.ok(helper,'production inline-resource policy helper must exist');
 if (!fs.existsSync(java)||!fs.existsSync(compiler)) return t.skip('Java/ECJ unavailable; compile check requires external toolchain');
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'carpe-native-'));
 try {
 fs.writeFileSync(path.join(temp,'InlinePolicy.java'),`public class InlinePolicy { ${helper} public static void main(String[] args) { for(String s: new String[]{"data","DATA","blob"}) if(!loadsInline(s)) throw new AssertionError(s); for(String s: new String[]{"http","https","file","content","javascript","ftp","","unknown"}) if(loadsInline(s)) throw new AssertionError(s); if(loadsInline(null)) throw new AssertionError("null"); } }`);
 execFileSync(java,['-jar',compiler,'-proc:none','-source','8','-target','8','-d',temp,path.join(temp,'InlinePolicy.java')],{stdio:'pipe'});
 execFileSync(java,['-cp',temp,'InlinePolicy'],{stdio:'pipe'});
 } finally { fs.rmSync(temp,{recursive:true,force:true}); }
});

test('Android AI asset paths stay under the packaged ai directory and picker imports enforce byte caps', t => {
 const java='/usr/lib/jvm/default-java/bin/java';
 const compiler=process.env.CARPE_ECJ || '/workspace/scratch/carpe-android-toolchain/ecj.jar';
 const source=fs.readFileSync('android-build/app/src/main/java/com/spencerwilliams/nightsweep/MainActivity.java','utf8');
 const cap=source.match(/private static final int MAX_PICKED_MODEL\s*=\s*[^;]+;/)?.[0];
 const pathPolicy=source.match(/    static boolean servesAIAsset\([\s\S]*?\n    }\n\n    static boolean allowsPickedFileSize\([\s\S]*?\n    }/)?.[0];
 assert.ok(cap,'production AI picker cap must exist');
 assert.ok(pathPolicy,'production asset path and picker size policies must exist');
 if (!fs.existsSync(java)||!fs.existsSync(compiler)) return t.skip('Java/ECJ unavailable; policy checks require external toolchain');
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'carpe-native-ai-'));
 try {
  const harness=`public class AIPolicy { ${cap} ${pathPolicy}
   static void yes(boolean value,String message){if(!value)throw new AssertionError(message);}
   static void no(boolean value,String message){if(value)throw new AssertionError(message);}
   public static void main(String[] args){
    yes(servesAIAsset("https","appassets.androidplatform.net","/ai/worker.js"),"worker asset");
    yes(servesAIAsset("HTTPS","APPASSETS.ANDROIDPLATFORM.NET","/ai/models/pp-ocrv6-tiny/model.onnx"),"bundled model asset");
    yes(servesAIAsset("https","appassets.androidplatform.net","/ai/ort-wasm-simd-threaded.wasm"),"runtime asset");
    no(servesAIAsset("http","appassets.androidplatform.net","/ai/worker.js"),"cleartext origin");
    no(servesAIAsset("https","evil.example","/ai/worker.js"),"foreign origin");
    no(servesAIAsset("https","appassets.androidplatform.net","/index.html"),"outside AI directory");
    no(servesAIAsset("https","appassets.androidplatform.net","/ai/../index.html"),"parent traversal");
    no(servesAIAsset("https","appassets.androidplatform.net","/ai/%2e%2e/index.html"),"encoded traversal");
    no(servesAIAsset("https","appassets.androidplatform.net","/ai//worker.js"),"empty path segment");
    no(servesAIAsset("https","appassets.androidplatform.net","/ai/worker\\\\.js"),"backslash");
    no(servesAIAsset("https","appassets.androidplatform.net","/ai/"),"directory only");
    long cap=128L*1024*1024;
    yes(allowsPickedFileSize(0,cap),"empty file boundary");
    yes(allowsPickedFileSize(cap,cap),"exact per-file and remaining boundary");
    yes(allowsPickedFileSize(cap-1,cap),"below limit");
    no(allowsPickedFileSize(cap+1,cap+1),"over 128 MiB per-file limit");
    no(allowsPickedFileSize(cap,cap-1),"over remaining aggregate budget");
    no(allowsPickedFileSize(-1,cap),"negative size");
    no(allowsPickedFileSize(1,-1),"negative remaining budget");
   }
  }`;
  const file=path.join(temp,'AIPolicy.java');fs.writeFileSync(file,harness);
  execFileSync(java,['-jar',compiler,'-proc:none','-source','8','-target','8','-d',temp,file],{stdio:'pipe'});
  execFileSync(java,['-cp',temp,'AIPolicy'],{stdio:'pipe'});
 } finally { fs.rmSync(temp,{recursive:true,force:true}); }
});
