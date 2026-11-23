const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon' };

function safeFile(urlPath) {
  const pathname = decodeURIComponent(urlPath.split('?')[0]);
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const candidate = path.resolve(root, relative);
  if (!candidate.startsWith(root)) return null;
  return candidate;
}

const server = http.createServer((req, res) => {
  const file = safeFile(req.url || '/');
  if (!file) { res.writeHead(403); return res.end('Forbidden'); }
  fs.stat(file, (err, stat) => {
    if (!err && stat.isFile()) {
      const ext = path.extname(file).toLowerCase();
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      return fs.createReadStream(file).pipe(res);
    }
    if ((req.headers.accept || '').includes('text/html')) {
      res.writeHead(200, { 'Content-Type': types['.html'], 'Cache-Control': 'no-cache' });
      return fs.createReadStream(path.join(root, 'index.html')).pipe(res);
    }
    res.writeHead(404); res.end('Not found');
  });
});

server.listen(port, '0.0.0.0', () => console.log(`quranportal listening on ${port}`));
