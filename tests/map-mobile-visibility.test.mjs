import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {chromium} from 'playwright';
test('mobile full-page selected station exposes readable input and output details',{skip:!existsSync('/usr/bin/chromium')},async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{const page=await browser.newPage({viewport:{width:375,height:800}});const css=readFileSync(new URL('../app/style.css',import.meta.url),'utf8');await page.setContent(`<style>${css}</style><div class="map-focus"><div class="selected-sheet"><div><span>IN 31 dBmV</span><span>OUT 43 dBmV</span><span>Needs input</span></div></div></div>`);
 const result=await page.locator('.selected-sheet span').evaluateAll(els=>els.map(el=>({display:getComputedStyle(el).display,size:parseFloat(getComputedStyle(el).fontSize),height:el.getBoundingClientRect().height})));assert.equal(result.length,3);assert.ok(result.every(x=>x.display!=='none'&&x.size>=12&&x.height>0));}finally{await browser.close();}
});
test('route overlays stay thin instead of covering the PDF when the map is highly zoomed',{skip:!existsSync('/usr/bin/chromium')},async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{const page=await browser.newPage({viewport:{width:240,height:240}}),css=readFileSync(new URL('../app/style.css',import.meta.url),'utf8');await page.setContent(`<style>${css}body{background:white}</style><div style="position:fixed;inset:0;background:white;--map-scale:128"><div class="map-annotation-layer" style="width:200px;height:200px;transform:scale(128)"><svg class="edge-overlay" viewBox="0 0 200 200"><line x1="0" y1="1" x2="200" y2="1" style="stroke:red"/></svg></div></div>`);const {createCanvas,loadImage}=await import('@napi-rs/canvas'),png=await page.screenshot(),image=await loadImage(png),canvas=createCanvas(240,240),ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);assert.deepEqual(Array.from(ctx.getImageData(30,140,1,1).data),[255,255,255,255]);assert.deepEqual(Array.from(ctx.getImageData(30,128,1,1).data),[255,0,0,255]);}finally{await browser.close();}
});
