import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');

let settings = {
  siteName: 'كل شيء بالمعقول',
  news: 'تابعوا أحدث منشورات المحل',
  featured: 'آخر المنشورات'
};

const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon'
};

function send(res, status, body, type='text/plain; charset=utf-8') {
  res.writeHead(status, {'Content-Type': type, 'Cache-Control': 'no-store'});
  res.end(body);
}

function serveFile(res, file) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return false;
  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, {'Content-Type': mime[ext] || 'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
  return true;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);

  if (req.method === 'GET' && pathname === '/api/health') {
    return send(res, 200, JSON.stringify({ok:true, service:'belma3qoul-web'}), mime['.json']);
  }
  if (req.method === 'GET' && pathname === '/api/settings') {
    return send(res, 200, JSON.stringify(settings), mime['.json']);
  }
  if (req.method === 'GET' && pathname === '/api/stats') {
    return send(res, 200, JSON.stringify({sales:0, products:0, customers:0, stock:0}), mime['.json']);
  }
  if (req.method === 'POST' && pathname === '/api/settings') {
    let body='';
    req.on('data', chunk => { body += chunk; if (body.length > 1000000) req.destroy(); });
    req.on('end', () => {
      try { settings = {...settings, ...JSON.parse(body || '{}')}; send(res, 200, JSON.stringify({ok:true,data:settings}), mime['.json']); }
      catch { send(res, 400, JSON.stringify({ok:false,error:'Invalid JSON'}), mime['.json']); }
    });
    return;
  }

  const safe = path.normalize(pathname).replace(/^([.][.][\\/])+/, '');
  const file = path.join(dist, safe);
  if (pathname !== '/' && serveFile(res, file)) return;
  const index = path.join(dist, 'index.html');
  if (serveFile(res, index)) return;
  send(res, 503, 'Production build not found');
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, '0.0.0.0', () => console.log(`belma3qoul-web running on ${port}`));
