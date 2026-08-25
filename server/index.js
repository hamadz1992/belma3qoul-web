import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');
const dataDir = path.join(root, 'data');
const dataFile = path.join(dataDir, 'site.json');
fs.mkdirSync(dataDir, { recursive: true });

const defaults = {
  siteName: 'كل شيء بالمعقول',
  news: 'تابعوا أحدث منشورات المحل',
  featured: 'آخر المنشورات',
  surpriseTitle: 'مفاجأة بانتظارك',
  surpriseMessage: 'هناك شيء جميل بانتظارك.',
  stats: { sales: 0, products: 0, customers: 0, stock: 0 },
  links: [],
  updatedAt: new Date().toISOString()
};

function loadData() {
  try { return { ...defaults, ...JSON.parse(fs.readFileSync(dataFile, 'utf8')) }; }
  catch { fs.writeFileSync(dataFile, JSON.stringify(defaults, null, 2)); return { ...defaults }; }
}
function saveData(data) { fs.writeFileSync(dataFile, JSON.stringify({ ...data, updatedAt: new Date().toISOString() }, null, 2)); }
let data = loadData();

const sessions = new Map();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const mime = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon' };
function send(res,status,body,type='text/plain; charset=utf-8'){res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store'});res.end(body)}
function json(res,status,obj){send(res,status,JSON.stringify(obj),mime['.json'])}
function serveFile(res,file){if(!fs.existsSync(file)||!fs.statSync(file).isFile())return false;const ext=path.extname(file).toLowerCase();res.writeHead(200,{'Content-Type':mime[ext]||'application/octet-stream'});fs.createReadStream(file).pipe(res);return true}
function readBody(req){return new Promise((resolve,reject)=>{let body='';req.on('data',chunk=>{body+=chunk;if(body.length>2_000_000){reject(new Error('Payload too large'));req.destroy()}});req.on('end',()=>resolve(body));req.on('error',reject)})}
function auth(req){const token=req.headers.cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith('belma3qoul_session='))?.split('=')[1];return token&&sessions.has(token)}
function setCookie(res,token){res.setHeader('Set-Cookie',`belma3qoul_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`)}

const server=http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost'); const pathname=decodeURIComponent(url.pathname);
    if(req.method==='GET'&&pathname==='/api/health')return json(res,200,{ok:true,service:'belma3qoul-web',time:new Date().toISOString()});
    if(req.method==='POST'&&pathname==='/api/auth/login'){const body=JSON.parse(await readBody(req)||'{}');if(body.password!==ADMIN_PASSWORD)return json(res,401,{ok:false,error:'Invalid credentials'});const token=crypto.randomBytes(24).toString('hex');sessions.set(token,Date.now()+86400000);setCookie(res,token);return json(res,200,{ok:true})}
    if(req.method==='POST'&&pathname==='/api/auth/logout'){const token=req.headers.cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith('belma3qoul_session='))?.split('=')[1];if(token)sessions.delete(token);res.setHeader('Set-Cookie','belma3qoul_session=; Path=/; Max-Age=0');return json(res,200,{ok:true})}
    if(req.method==='GET'&&pathname==='/api/auth/me')return json(res,200,{authenticated:auth(req)});
    if(req.method==='GET'&&pathname==='/api/settings')return json(res,200,{siteName:data.siteName,news:data.news,featured:data.featured,surpriseTitle:data.surpriseTitle,surpriseMessage:data.surpriseMessage,updatedAt:data.updatedAt});
    if(req.method==='POST'&&pathname==='/api/settings'){if(!auth(req))return json(res,401,{ok:false,error:'Unauthorized'});const body=JSON.parse(await readBody(req)||'{}');data={...data,...Object.fromEntries(['siteName','news','featured','surpriseTitle','surpriseMessage'].filter(k=>body[k]!==undefined).map(k=>[k,String(body[k])]))};saveData(data);return json(res,200,{ok:true,data})}
    if(req.method==='GET'&&pathname==='/api/stats')return json(res,200,data.stats);
    if(req.method==='PUT'&&pathname==='/api/stats'){if(!auth(req))return json(res,401,{ok:false,error:'Unauthorized'});const body=JSON.parse(await readBody(req)||'{}');data.stats={...data.stats,...Object.fromEntries(['sales','products','customers','stock'].filter(k=>Number.isFinite(Number(body[k]))).map(k=>[k,Number(body[k])]))};saveData(data);return json(res,200,{ok:true,data:data.stats})}
    if(req.method==='GET'&&pathname==='/api/links')return json(res,200,data.links||[]);
    if(req.method==='PUT'&&pathname==='/api/links'){if(!auth(req))return json(res,401,{ok:false,error:'Unauthorized'});const body=JSON.parse(await readBody(req)||'[]');if(!Array.isArray(body))return json(res,400,{ok:false,error:'links must be an array'});data.links=body;saveData(data);return json(res,200,{ok:true,data:data.links})}

    const safe=path.normalize(pathname).replace(/^([.][.][\\/])+/, '');const file=path.join(dist,safe);
    if(pathname!=='/'&&serveFile(res,file))return;
    const index=path.join(dist,'index.html');if(serveFile(res,index))return;
    return send(res,503,'Production build not found');
  } catch(err){ return json(res,500,{ok:false,error:err.message||'Server error'}); }
});

const port=Number(process.env.PORT)||3000;
server.listen(port,'0.0.0.0',()=>console.log(`belma3qoul-web running on ${port}`));
