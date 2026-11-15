const esbuild = require('esbuild');
const fs = require('node:fs');
const result = esbuild.buildSync({entryPoints:[__dirname+'/main.mjs'],bundle:true,format:'iife',platform:'browser',target:'es2022',minify:false,write:false,legalComments:'inline'});
process.stdout.write(result.outputFiles[0].text);
