import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');
const dataDir = path.join(root, 'data');
const siteFile = path.join(dataDir, 'site.json');
const promotionFile = path.join(dataDir, 'promotions.json');
fs.mkdirSync(dataDir, { recursive: true });

const siteDefaults = {
  siteName: 'كل شيء بالمعقول', news: 'تابعوا أحدث منشورات المحل', featured: 'آخر المنشورات',
  surpriseTitle: 'مفاجأتك بانتظارك 🎁', surpriseMessage: 'امسح QR واكتشف مفاجأتك.',
  stats: { sales: 0, products: 0, customers: 0, stock: 0 }, links: [], updatedAt: new Date().toISOString()
};
const promotionDefaults = {
  settings: { enabled: true, title: 'مفاجأتك بانتظارك 🎁', message: 'امسح QR واكتشف مفاجأتك.', attemptsPerVisitor: 1, campaignStart: null, campaignEnd: null },
  prizes: [], plays: [], updatedAt: null
};

function loadJson(file, fallback) {
  try { return { ...fallback, ...JSON.parse(fs.readFileSync(file, 'utf8')) }; }
  catch { fs.writeFileSync(file, JSON.stringify(fallback, null, 2)); return structuredClone(fallback); }
}
function saveJson(file, value) { fs.writeFileSync(file, JSON.stringify({ ...value, updatedAt: new Date().toISOString() }, null, 2)); }
let site = loadJson(siteFile, siteDefaults);
let promotion = loadJson(promotionFile, promotionDefaults);

const sessions = new Map();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const mime = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon' };
const now = () => Date.now();
const id = (prefix='id') => `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
function send(res,status,body,type='text/plain; charset=utf-8',extra={}) { res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', ...extra }); res.end(body); }
function json(res,status,obj) { send(res,status,JSON.stringify(obj),mime['.json']); }
function serveFile(res,file) { if(!fs.existsSync(file)||!fs.statSync(file).isFile()) return false; const ext=path.extname(file).toLowerCase(); res.writeHead(200,{'Content-Type':mime[ext]||'application/octet-stream'}); fs.createReadStream(file).pipe(res); return true; }
function readBody(req) { return new Promise((resolve,reject)=>{ let body=''; req.on('data',c=>{ body+=c; if(body.length>2_000_000){ reject(new Error('Payload too large')); req.destroy(); } }); req.on('end',()=>resolve(body)); req.on('error',reject); }); }
function cookie(req,name) { return req.headers.cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith(`${name}=`))?.split('=').slice(1).join('='); }
function auth(req) { const token=cookie(req,'belma3qoul_session'); return token && sessions.has(token) && sessions.get(token)>now(); }
function setCookie(res,name,value,maxAge=86400) { res.setHeader('Set-Cookie',`${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`); }
function visitorKey(req) { const existing=cookie(req,'belma3qoul_visitor'); if(existing) return existing; const token=crypto.randomBytes(16).toString('hex'); return token; }
function campaignActive() { const s=promotion.settings; const t=now(); if(!s.enabled) return false; if(s.campaignStart && t < new Date(s.campaignStart).getTime()) return false; if(s.campaignEnd && t > new Date(s.campaignEnd).getTime()) return false; return true; }
function publicPromotion() { return { ...promotion.settings, prizes: promotion.prizes.filter(p=>p.enabled).map(p=>({id:p.id,name:p.name,type:p.type,value:p.value,remaining:p.remaining,link:p.link})) }; }
function pickPrize() {
  const available=promotion.prizes.filter(p=>p.enabled && Number(p.remaining)>0);
  if(!available.length) return null;
  const total=available.reduce((sum,p)=>sum+Math.max(0,Number(p.weight)||0),0);
  if(total<=0) return available[Math.floor(Math.random()*available.length)];
  let cursor=Math.random()*total;
  for(const prize of available){ cursor-=Math.max(0,Number(prize.weight)||0); if(cursor<=0) return prize; }
  return available.at(-1);
}
function safePrize(prize) { return prize ? { id:prize.id, name:prize.name, type:prize.type, value:prize.value, link:prize.link||'' } : null; }
function visitorPlay(req,key) { return promotion.plays.find(p=>p.visitorKey===key); }

const server=http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost'); const pathname=decodeURIComponent(url.pathname);
    if(req.method==='GET'&&pathname==='/api/health') return json(res,200,{ok:true,service:'belma3qoul-web',time:new Date().toISOString()});
    if(req.method==='POST'&&pathname==='/api/auth/login'){ const body=JSON.parse(await readBody(req)||'{}'); if(body.password!==ADMIN_PASSWORD) return json(res,401,{ok:false,error:'Invalid credentials'}); const token=crypto.randomBytes(24).toString('hex'); sessions.set(token,now()+86400000); setCookie(res,'belma3qoul_session',token); return json(res,200,{ok:true}); }
    if(req.method==='POST'&&pathname==='/api/auth/logout'){ const token=cookie(req,'belma3qoul_session'); if(token)sessions.delete(token); setCookie(res,'belma3qoul_session','',0); return json(res,200,{ok:true}); }
    if(req.method==='GET'&&pathname==='/api/auth/me') return json(res,200,{authenticated:Boolean(auth(req))});

    if(req.method==='GET'&&pathname==='/api/settings') return json(res,200,{...site, surpriseTitle:promotion.settings.title, surpriseMessage:promotion.settings.message});
    if(req.method==='POST'&&pathname==='/api/settings'){ if(!auth(req)) return json(res,401,{ok:false,error:'Unauthorized'}); const body=JSON.parse(await readBody(req)||'{}'); for(const k of ['siteName','news','featured']) if(body[k]!==undefined) site[k]=String(body[k]); saveJson(siteFile,site); return json(res,200,{ok:true,data:site}); }
    if(req.method==='GET'&&pathname==='/api/stats') return json(res,200,{...site.stats, qrScans:promotion.plays.length, winners:promotion.plays.filter(p=>p.prizeType!=='message').length, remainingPrizes:promotion.prizes.reduce((n,p)=>n+Math.max(0,Number(p.remaining)||0),0)});

    if(req.method==='GET'&&pathname==='/api/promotion/public') return json(res,200,{active:campaignActive(),...publicPromotion()});
    if(req.method==='POST'&&pathname==='/api/promotion/play'){
      if(!campaignActive()) return json(res,409,{ok:false,error:'لا توجد مسابقة نشطة حالياً'});
      const key=visitorKey(req); const previous=visitorPlay(req,key); const limit=Math.max(1,Number(promotion.settings.attemptsPerVisitor)||1);
      if(previous && promotion.plays.filter(p=>p.visitorKey===key).length>=limit) return json(res,429,{ok:false,error:'لقد شاركت من قبل',play:safePrize(previous.prize)});
      const prize=pickPrize(); if(!prize) return json(res,409,{ok:false,error:'انتهت جميع الجوائز'});
      prize.remaining=Math.max(0,Number(prize.remaining)-1);
      const play={id:id('play'),visitorKey:key,prizeId:prize.id,prizeName:prize.name,prizeType:prize.type,prizeValue:prize.value,createdAt:new Date().toISOString(),claimed:false};
      promotion.plays.push(play); saveJson(promotionFile,promotion); setCookie(res,'belma3qoul_visitor',key,31536000); return json(res,200,{ok:true,play:{id:play.id,prize:safePrize(prize)}});
    }
    if(req.method==='GET'&&pathname==='/api/qr'){
      const base=`${url.origin}/surprise`; const png=await QRCode.toBuffer(base,{type:'png',width:512,margin:2,errorCorrectionLevel:'H'}); return send(res,200,png,'image/png',{'Content-Length':png.length});
    }

    if(req.method==='GET'&&pathname==='/api/admin/promotion') { if(!auth(req)) return json(res,401,{ok:false,error:'Unauthorized'}); return json(res,200,promotion); }
    if(req.method==='PUT'&&pathname==='/api/admin/promotion/settings') { if(!auth(req)) return json(res,401,{ok:false,error:'Unauthorized'}); const body=JSON.parse(await readBody(req)||'{}'); promotion.settings={...promotion.settings,...Object.fromEntries(['enabled','title','message','attemptsPerVisitor','campaignStart','campaignEnd'].filter(k=>body[k]!==undefined).map(k=>[k,k==='attemptsPerVisitor'?Math.max(1,Number(body[k])||1):body[k]]))}; saveJson(promotionFile,promotion); return json(res,200,{ok:true,data:promotion.settings}); }
    if(req.method==='POST'&&pathname==='/api/admin/prizes') { if(!auth(req)) return json(res,401,{ok:false,error:'Unauthorized'}); const b=JSON.parse(await readBody(req)||'{}'); const q=Math.max(0,Number(b.quantity)||0); const prize={id:id('prize'),name:String(b.name||'جائزة جديدة'),type:String(b.type||'message'),value:String(b.value||''),quantity:q,remaining:q,enabled:b.enabled!==false,weight:Math.max(0,Number(b.weight)||0),link:String(b.link||'')}; promotion.prizes.push(prize); saveJson(promotionFile,promotion); return json(res,201,{ok:true,data:prize}); }
    if(req.method==='PUT'&&pathname.startsWith('/api/admin/prizes/')) { if(!auth(req)) return json(res,401,{ok:false,error:'Unauthorized'}); const pid=pathname.split('/').at(-1); const prize=promotion.prizes.find(p=>p.id===pid); if(!prize) return json(res,404,{ok:false,error:'Prize not found'}); const b=JSON.parse(await readBody(req)||'{}'); for(const k of ['name','type','value','link']) if(b[k]!==undefined) prize[k]=String(b[k]); for(const k of ['enabled','weight']) if(b[k]!==undefined) prize[k]=k==='weight'?Math.max(0,Number(b[k])||0):Boolean(b[k]); if(b.quantity!==undefined){const q=Math.max(0,Number(b.quantity)||0); const used=Math.max(0,Number(prize.quantity)-Number(prize.remaining)); prize.quantity=q; prize.remaining=Math.max(0,q-used);} saveJson(promotionFile,promotion); return json(res,200,{ok:true,data:prize}); }
    if(req.method==='DELETE'&&pathname.startsWith('/api/admin/prizes/')) { if(!auth(req)) return json(res,401,{ok:false,error:'Unauthorized'}); const pid=pathname.split('/').at(-1); promotion.prizes=promotion.prizes.filter(p=>p.id!==pid); saveJson(promotionFile,promotion); return json(res,200,{ok:true}); }
    if(req.method==='GET'&&pathname==='/api/admin/plays') { if(!auth(req)) return json(res,401,{ok:false,error:'Unauthorized'}); return json(res,200,promotion.plays.slice().reverse()); }
    if(req.method==='PUT'&&pathname.startsWith('/api/admin/plays/')) { if(!auth(req)) return json(res,401,{ok:false,error:'Unauthorized'}); const play=promotion.plays.find(p=>p.id===pathname.split('/').at(-1)); if(!play) return json(res,404,{ok:false,error:'Play not found'}); const b=JSON.parse(await readBody(req)||'{}'); if(b.claimed!==undefined) play.claimed=Boolean(b.claimed); saveJson(promotionFile,promotion); return json(res,200,{ok:true,data:play}); }

    const safe=path.normalize(pathname).replace(/^([.][.][\\/])+/, ''); const file=path.join(dist,safe); if(pathname!=='/'&&serveFile(res,file)) return;
    const index=path.join(dist,'index.html'); if(serveFile(res,index)) return; return send(res,503,'Production build not found');
  } catch(err) { return json(res,500,{ok:false,error:err.message||'Server error'}); }
});
const port=Number(process.env.PORT)||3000; server.listen(port,'0.0.0.0',()=>console.log(`belma3qoul-web running on ${port}`));
