const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http'),{spawn}=require('node:child_process'),assert=require('node:assert/strict');
const root=path.join(__dirname,'../public'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'pqstrd-entry-test-')),wait=ms=>new Promise(r=>setTimeout(r,ms));let browser,ws,send,count=0;const errors=[];const check=(x,m)=>{assert.ok(x,m);count++;console.log('PASS',m);};
const server=http.createServer((req,res)=>{const rel=decodeURIComponent(new URL(req.url,'http://local').pathname),f=path.resolve(root,'.'+(rel==='/'?'/index.html':rel));if(!f.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}fs.readFile(f,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'})[path.extname(f)]||'text/plain'});res.end(e?'not found':b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;browser=spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=0','--user-data-dir='+path.join(dir,'profile'),'about:blank'],{windowsHide:true,stdio:'ignore'});const pf=path.join(dir,'profile','DevToolsActivePort');let port;for(let i=0;i<100&&!port;i++){await wait(100);try{port=fs.readFileSync(pf,'utf8').split('\n')[0];}catch{}}if(!port)throw Error('Edge não disponibilizou CDP');const targets=await(await fetch('http://127.0.0.1:'+port+'/json')).json();ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));let id=0;const pending=new Map();ws.addEventListener('message',e=>{const d=JSON.parse(e.data);if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails);if(d.id&&pending.has(d.id)){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(d.error):p.resolve(d.result);}});send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
const ev=async exp=>{const r=await send('Runtime.evaluate',{expression:exp,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const nav=async url=>{await send('Page.navigate',{url:url.startsWith('http')?url:origin+'/'+url});for(let i=0;i<120;i++){await wait(50);if(await ev("document.readyState==='complete' && location.href!=='about:blank'"))break;}await ev('Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,1800))]).then(()=>true)');};
const size=async(w,h=900)=>send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:false});const click=id=>ev(`document.getElementById(${JSON.stringify(id)}).click()`);const input=(id,v)=>ev(`(()=>{const e=document.getElementById(${JSON.stringify(id)});e.value=${JSON.stringify(String(v))};e.dispatchEvent(new Event('input',{bubbles:true}));})()`);
const screenshot=async name=>{const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(dir,name+'.png'),Buffer.from(r.data,'base64'));};

await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setBlockedURLs',{urls:['https://fonts.googleapis.com/*','https://fonts.gstatic.com/*']});await send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:dir});await size(1440);await nav('index.html');
const change=(id,v)=>ev('(()=>{const e=document.getElementById('+JSON.stringify(id)+');e.value='+JSON.stringify(String(v))+';e.dispatchEvent(new Event("change",{bubbles:true}));})()');
const submit=id=>ev('document.getElementById('+JSON.stringify(id)+').requestSubmit()');
const snap=()=>ev('GerenciamentoApp.snapshot()');
const esc=async()=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await wait(60);};
const content={
 'pt-BR':['GERENCIAMENTO DE RISCO GRATUITO','Defina seu risco.','Busque sua meta.','Sem cadastro. Sem assinatura.','og-cover.png'],
 en:['FREE RISK MANAGEMENT','Define your risk.','Work toward your target.','No sign-up. No subscription.','og-cover-en.png'],
 es:['GESTIÓN DE RIESGO GRATUITA','Define tu riesgo.','Busca tu objetivo.','Sin registro. Sin suscripción.','og-cover-es.png']
};
for(const [lang,copy]of Object.entries(content)){
 const png=await ev(`(async()=>{
 const copy=${JSON.stringify(copy)},c=document.createElement('canvas');c.width=1200;c.height=630;const x=c.getContext('2d');
 x.fillStyle='#070e14';x.fillRect(0,0,1200,630);
 const text=(value,y,size,color,bold=true)=>{x.font=(bold?'700 ':'400 ')+size+'px Arial';x.fillStyle=color;x.fillText(value,72,y,1050);};
 text(copy[0],88,22,'#47dfc2');text('Paraquedas',205,78,'#e9f0f7');text('do Trader Indisciplinado',245,25,'#a4b6c5',false);
 text(copy[1],358,52,'#e9f0f7');text(copy[2],425,52,'#47dfc2');text('WIN · WDO · BRL',510,24,'#a4b6c5');text(copy[3],565,23,'#a4b6c5',false);
 x.save();x.translate(945,130);x.scale(.35,.35);x.fillStyle='#47dfc2';x.fill(new Path2D('M30 190 Q210 -40 390 190 Q345 165 300 190 Q255 165 210 190 Q165 165 120 190 Q75 165 30 190 Z'));x.strokeStyle='#dce7f0';x.lineWidth=8;x.stroke(new Path2D('M30 190L165 335M210 190V335M390 190L255 335'));x.fillStyle='#e9f0f7';x.fillRect(140,330,140,100);x.restore();
 return c.toDataURL('image/png').split(',')[1];})()`);
 fs.writeFileSync(path.join(root,'assets',copy[4]),Buffer.from(png,'base64'));console.log('Gerada',copy[4]);
}
await Promise.race([send('Browser.close').catch(()=>{}),wait(1000)]);
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();browser?.kill();server.closeAllConnections();server.close();});
