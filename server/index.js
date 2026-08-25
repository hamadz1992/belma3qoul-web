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
  prizes: [], plays: [], qrToken: '', updatedAt: null
};

function loadJson(file, fallback) {
  try { return { ...fallback, ...JSON.parse(fs.readFileSync(file, 'utf8')) }; }
  catch { fs.writeFileSync(file, JSON.stringify(fallback, null, 2)); return structuredClone(fallback); }
}
function saveJson(file, value) {
  const temp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temp, JSON.stringify({ ...value, updatedAt: new Date().toISOString() }, null, 2), 'utf8');
  fs.renameSync(temp, file);
}
let site = loadJson(siteFile, siteDefaults);
let promotion = loadJson(promotionFile, promotionDefaults);
if (!promotion.qrToken) { promotion.qrToken = crypto.randomBytes(24).toString('hex'); saveJson(promotionFile, promotion); }

const sessions = new Map();
const rateLimits = new Map();
const isProduction = process.env.NODE_ENV === 'production';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (isProduction ? '' : 'admin123');
const mime = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon' };
const now = () => Date.now();
const id = (prefix='id') => `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
function send(res,status,body,type='text/plain; charset=utf-8',extra={}) {
  res.writeHead(status, {'Content-Type': type,'Cache-Control': 'no-store','X-Content-Type-Options': 'nosniff','X-Frame-Options': 'SAMEORIGIN','Referrer-Policy': 'strict-origin-when-cross-origin',...extra});
  res.end(body);
}
function json(res,status,obj) { send(res,status,JSON.stringify(obj),mime['.json']); }
function serveFile(res,file) { if(!fs.existsSync(file)||!fs.statSync(file).isFile()) return false; const ext=path.extname(file).toLowerCase(); send(res,200,fs.readFileSync(file),mime[ext]||'application/octet-stream',{}); return true; }
function readBody(req) { return new Promise((resolve,reject)=>{ let body=''; req.on('data',c=>{ body+=c; if(body.length>2_000_000){ reject(new Error('Payload too large')); req.destroy(); } }); req.on('end',()=>resolve(body)); req.on('error',reject); }); }
function cookie(req,name) { return req.headers.cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith(`${name}=`))?.split('=').slice(1).join('='); }
function auth(req) { const token=cookie(req,'belma3qoul_session'); return token && sessions.has(token) && sessions.get(token)>now(); }
function setCookie(res,name,value,maxAge=86400) { const secure=isProduction?' Secure;':''; res.setHeader('Set-Cookie',`${name}=${value}; Path=/; HttpOnly; SameSite=Lax;${secure} Max-Age=${maxAge}`); }
function visitorKey(req) { return cookie(req,'belma3qoul_visitor') || crypto.randomBytes(16).toString('hex'); }
function campaignActive() { const s=promotion.settings; const t=now(); if(!s.enabled) return false; if(s.campaignStart && t < new Date(s.campaignStart).getTime()) return false; if(s.campaignEnd && t > new Date(s.campaignEnd).getTime()) return false; return true; }
function pickPrize() { const available=promotion.prizes.filter(p=>p.enabled && Number(p.remaining)>0); if(!available.length)return null; const total=available.reduce((sum,p)=>sum+Math.max(0,Number(p.weight)||0),0); if(total<=0)return available[Math.floor(Math.random()*available.length)]; let cursor=Math.random()*total; for(const prize of available){cursor-=Math.max(0,Number(prize.weight)||0);if(cursor<=0)return prize;} return available.at(-1); }
function resultFromPlay(play) { return play ? {id:play.prizeId,name:play.prizeName,type:play.prizeType,value:play.prizeValue,link:play.prizeLink||''} : null; }
function visitorPlays(key) { return promotion.plays.filter(p=>p.visitorKey===key); }
function rateLimit(req,key,limit=8,windowMs=60_000) {
  const ip=(req.headers['x-forwarded-for']||req.socket.remoteAddress||'unknown').toString().split(',')[0].trim();
  const idKey=`${key}:${ip}`; const t=now(); const entry=rateLimits.get(idKey);
  if(!entry||t-entry.started>windowMs){rateLimits.set(idKey,{started:t,count:1});return true;}
  entry.count+=1; return entry.count<=limit;
}
function cleanup() { const t=now(); for(const [k,v] of sessions) if(v<=t) sessions.delete(k); for(const [k,v] of rateLimits) if(t-v.started>60_000) rateLimits.delete(k); }
setInterval(cleanup,60_000).unref();

const server=http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost'); const pathname=decodeURIComponent(url.pathname);
    if(req.method==='GET'&&pathname==='/api/health') return json(res,200,{ok:true,service:'belma3qoul-web',time:new Date().toISOString()});
    if(req.method==='POST'&&pathname==='/api/auth/login'){
      if(!ADMIN_PASSWORD)return json(res,503,{ok:false,error:'ADMIN_PASSWORD غير مضبوط على الخادم'});
      if(!rateLimit(req,'login',8,60_000))return json(res,429,{ok:false,error:'محاولات دخول كثيرة، حاول لاحقاً'});
      const body=JSON.parse(await readBody(req)||'{}');
      if(typeof body.password!=='string'||body.password!==ADMIN_PASSWORD)return json(res,401,{ok:false,error:'بيانات الدخول غير صحيحة'});
      const token=crypto.randomBytes(32).toString('hex');sessions.set(token,now()+86400000);setCookie(res,'belma3qoul_session',token);return json(res,200,{ok:true});
    }
    if(req.method==='POST'&&pathname==='/api/auth/logout'){const token=cookie(req,'belma3qoul_session');if(token)sessions.delete(token);setCookie(res,'belma3qoul_session','',0);return json(res,200,{ok:true});}
    if(req.method==='GET'&&pathname==='/api/auth/me')return json(res,200,{authenticated:Boolean(auth(req))});
    if(req.method==='GET'&&pathname==='/api/settings')return json(res,200,{...site,surpriseTitle:promotion.settings.title,surpriseMessage:promotion.settings.message});
    if(req.method==='POST'&&pathname==='/api/settings'){if(!auth(req))return json(res,401,{ok:false,error:'Unauthorized'});const body=JSON.parse(await readBody(req)||'{}');for(const k of ['siteName','news','featured'])if(body[k]!==undefined)site[k]=String(body[k]);saveJson(siteFile,site);return json(res,200,{ok:true,data:site});}
    if(req.method==='GET'&&pathname==='/api/stats')return json(res,200,{...site.stats,qrScans:promotion.plays.length,winners:promotion.plays.filter(p=>p.prizeType!=='message').length,remainingPrizes:promotion.prizes.reduce((n,p)=>n+Math.max(0,Number(p.remaining)||0),0)});
    if(req.method==='GET'&&pathname==='/api/promotion/public')return json(res,200,{active:campaignActive(),title:promotion.settings.title,message:promotion.settings.message,attemptsPerVisitor:promotion.settings.attemptsPerVisitor});
    if(req.method==='POST'&&pathname==='/api/promotion/play'){
      if(cookie(req,'belma3qoul_qr_access')!=='1')return json(res,403,{ok:false,error:'يجب مسح رمز QR للدخول إلى المفاجأة'});
      if(!campaignActive())return json(res,409,{ok:false,error:'لا توجد مسابقة نشطة حالياً'});
      if(!rateLimit(req,'play',20,60_000))return json(res,429,{ok:false,error:'طلبات كثيرة، حاول بعد قليل'});
      const key=visitorKey(req);const attempts=visitorPlays(key);const limit=Math.max(1,Number(promotion.settings.attemptsPerVisitor)||1);
      if(attempts.length>=limit){const previous=attempts.at(-1);setCookie(res,'belma3qoul_visitor',key,31536000);return json(res,429,{ok:false,error:'لقد استنفدت محاولتك',play:{id:previous.id,prize:resultFromPlay(previous)}});}
      const prize=pickPrize();if(!prize)return json(res,409,{ok:false,error:'انتهت جميع الجوائز'});prize.remaining=Math.max(0,Number(prize.remaining)-1);
      const play={id:id('play'),visitorKey:key,prizeId:prize.id,prizeName:prize.name,prizeType:prize.type,prizeValue:prize.value,prizeLink:prize.link||'',createdAt:new Date().toISOString(),claimed:false};promotion.plays.push(play);saveJson(promotionFile,promotion);setCookie(res,'belma3qoul_visitor',key,31536000);return json(res,200,{ok:true,play:{id:play.id,prize:resultFromPlay(play)}});
    }
    if(req.method==='GET'&&pathname==='/api/qr'){
      const target=`${url.origin}/surprise?token=${encodeURIComponent(promotion.qrToken)}`;
      const png=await QRCode.toBuffer(target,{type:'png',width:512,margin:2,errorCorrectionLevel:'H'});
      return send(res,200,png,'image/png',{'Content-Length':png.length,'Cache-Control':'public, max-age=300'});
    }
    if(req.method==='GET'&&pathname==='/surprise'&&!url.searchParams.get('token')) return send(res,302,'','text/plain; charset=utf-8',{Location:'/#qr'});
    if(req.method==='GET'&&pathname==='/surprise'&&url.searchParams.get('token')===promotion.qrToken){ setCookie(res,'belma3qoul_qr_access','1',600); }
    if(req.method==='GET'&&pathname==='/api/admin/promotion'){if(!auth(req))return json(res,401,{ok:false,error:'Unauthorized'});return json(res,200,promotion);}
    if(req.method==='PUT'&&pathname==='/api/admin/promotion/settings'){if(!auth(req))return json(res,401,{ok:false,error:'Unauthorized'});const body=JSON.parse(await readBody(req)||'{}');promotion.settings={...promotion.settings,...Object.fromEntries(['enabled','title','message','attemptsPerVisitor','campaignStart','campaignEnd'].filter(k=>body[k]!==undefined).map(k=>[k,k==='attemptsPerVisitor'?Math.max(1,Number(body[k])||1):body[k]]))};saveJson(promotionFile,promotion);return json(res,200,{ok:true,data:promotion.settings});}
    if(req.method==='POST'&&pathname==='/api/admin/prizes'){if(!auth(req))return json(res,401,{ok:false,error:'Unauthorized'});const b=JSON.parse(await readBody(req)||'{}');const q=Math.max(0,Number(b.quantity)||0);const prize={id:id('prize'),name:String(b.name||'جائزة جديدة'),type:String(b.type||'message'),value:String(b.value||''),quantity:q,remaining:q,enabled:b.enabled!==false,weight:Math.max(0,Number(b.weight)||0),link:String(b.link||'')};promotion.prizes.push(prize);saveJson(promotionFile,promotion);return json(res,201,{ok:true,data:prize});}
    if(req.method==='PUT'&&pathname.startsWith('/api/admin/prizes/')){if(!auth(req))return json(res,401,{ok:false,error:'Unauthorized'});const prize=promotion.prizes.find(p=>p.id===pathname.split('/').at(-1));if(!prize)return json(res,404,{ok:false,error:'Prize not found'});const b=JSON.parse(await readBody(req)||'{}');for(const k of ['name','type','value','link'])if(b[k]!==undefined)prize[k]=String(b[k]);if(b.enabled!==undefined)prize.enabled=Boolean(b.enabled);if(b.weight!==undefined)prize.weight=Math.max(0,Number(b.weight)||0);if(b.quantity!==undefined){const q=Math.max(0,Number(b.quantity)||0);const used=Math.max(0,Number(prize.quantity)-Number(prize.remaining));prize.quantity=q;prize.remaining=Math.max(0,q-used);}saveJson(promotionFile,promotion);return json(res,200,{ok:true,data:prize});}
    if(req.method==='DELETE'&&pathname.startsWith('/api/admin/prizes/')){if(!auth(req))return json(res,401,{ok:false,error:'Unauthorized'});promotion.prizes=promotion.prizes.filter(p=>p.id!==pathname.split('/').at(-1));saveJson(promotionFile,promotion);return json(res,200,{ok:true});}
    if(req.method==='GET'&&pathname==='/api/admin/plays'){if(!auth(req))return json(res,401,{ok:false,error:'Unauthorized'});return json(res,200,promotion.plays.slice().reverse());}
    if(req.method==='PUT'&&pathname.startsWith('/api/admin/plays/')){if(!auth(req))return json(res,401,{ok:false,error:'Unauthorized'});const play=promotion.plays.find(p=>p.id===pathname.split('/').at(-1));if(!play)return json(res,404,{ok:false,error:'Play not found'});const b=JSON.parse(await readBody(req)||'{}');if(b.claimed!==undefined)play.claimed=Boolean(b.claimed);saveJson(promotionFile,promotion);return json(res,200,{ok:true,data:play});}
    const safe=path.normalize(pathname).replace(/^([.][.][\\/])+/, '');const file=path.join(dist,safe);if(pathname!=='/'&&serveFile(res,file))return;const index=path.join(dist,'index.html');if(serveFile(res,index))return;return send(res,503,'Production build not found');
  }catch(err){return json(res,500,{ok:false,error:err.message||'Server error'});}
});
const port=Number(process.env.PORT)||3000;server.listen(port,'0.0.0.0',()=>console.log(`belma3qoul-web running on ${port}`));
