/* QA-only preload: serve current source in memory in place of stale standalone HTML. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'../..'),src=path.join(root,'night-sweep'),read=fs.readFileSync;
let html=read(path.join(src,'shell.html'),'utf8');
for(const [,token,name] of read(path.join(src,'build.py'),'utf8').matchAll(/\('([^']*<!--[^']*-->)', '([^']+)'\)/g)){
 let data=read(path.join(src,name),'utf8');if(name==='catalog.json'){const c=JSON.parse(data);c.setupManuals=JSON.parse(read(path.join(src,'setup-manuals.json'),'utf8'));data=JSON.stringify(c);}html=html.split(token).join(data);
}
html=html.replace('<!--DSIMPILOTCODES-->',read(path.join(src,'dsim-pilot-codes.js'),'utf8'));
fs.readFileSync=function(file,options){
 if((typeof file==='string'||file instanceof URL)&&path.resolve(String(file))===path.join(root,'outputs/Night_Sweep.html'))return typeof options==='string'||options?.encoding?html:Buffer.from(html);
 return read.apply(this,arguments);
};
