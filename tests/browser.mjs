import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import assert from 'node:assert/strict';
const password=randomBytes(32).toString('hex');
const port=3100,origin=`http://localhost:${port}`;
const server=spawn('node',['node_modules/next/dist/bin/next','start','-p',String(port)],{env:{...process.env,ADMIN_PASSWORD:password,ADMIN_USER:'admin',SITE_URL:origin,STORE_LIVE:'false'},stdio:'ignore'});
let browser;
try{
 let ready=false;for(let n=0;n<60;n++){try{if((await fetch(origin)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}assert.ok(ready,'server started');
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin,{waitUntil:'networkidle'});
 assert.equal(await page.locator('h1').count(),1);
 assert.equal(await page.locator('.swatch').count(),19);
 for(let n=1;n<=19;n++){await page.getByRole('button',{name:`Alege Nuanța ${String(n).padStart(2,'0')}`,exact:true}).click();await page.locator('.product-photo img').evaluate(img=>img.decode());assert.match(await page.locator('.product-photo img').getAttribute('src'),new RegExp(`(?:%2F|/)${n}\\.jpg`));}
 await page.reload({waitUntil:'networkidle'});assert.equal(await page.getByRole('button',{name:'Alege Nuanța 19',exact:true}).getAttribute('aria-pressed'),'true');
 await page.getByRole('button',{name:'Mărește cantitatea'}).click();assert.match(await page.locator('.buy').innerText(),/338/);
 await page.locator('.buy').click();assert.match(await page.locator('.form-error').innerText(),/Pregătim/);
 await page.evaluate(()=>sessionStorage.clear());await page.reload({waitUntil:'networkidle'});await page.evaluate(()=>window.scrollTo(0,0));
 await page.screenshot({path:'/tmp/pucioasa-desktop.png',fullPage:true});
 for(const width of [390,320]){await page.setViewportSize({width,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),`no overflow at ${width}`);await page.getByRole('button',{name:'Deschide meniul'}).click();await page.locator('.nav').getByText('Ce conține setul').click();assert.equal(await page.getByRole('button',{name:'Deschide meniul'}).getAttribute('aria-expanded'),'false');}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.scrollTo(0,0));await page.locator('.mobile-buy .primary').waitFor({state:'visible'});await page.screenshot({path:'/tmp/pucioasa-mobile.png',fullPage:false});
 assert.equal((await fetch(origin+'/admin')).status,401);
 assert.equal((await fetch(origin+'/admin',{headers:{Authorization:'Basic '+Buffer.from(`admin:${password}`).toString('base64')}})).status,200);
 assert.equal((await fetch(origin+'/api/checkout',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({color:'v01',quantity:1})})).status,503);
 assert.equal((await fetch(origin+'/api/checkout',{method:'POST',headers:{Origin:'https://untrusted.example','Content-Type':'application/json'},body:'{}'})).status,403);
 await page.goto(origin+'/comanda/succes?session_id=invalid');assert.match(await page.locator('h1').innerText(),/Nu putem confirma/);
 for(const slug of ['termeni','livrare-retur','confidentialitate'])assert.equal((await fetch(origin+'/informatii/'+slug)).status,200);
 assert.match(await (await fetch(origin+'/robots.txt')).text(),/Disallow: \//);
 assert.deepEqual(errors,[],'no browser runtime errors');
 console.log('PASS: 19 variant images, persistence, quantity total, prelaunch feedback, 320/390px layouts, mobile menu, admin auth, checkout origin/config guards, false confirmation prevention, legal pages and prelaunch robots.');
}finally{await browser?.close();server.kill('SIGTERM');}
