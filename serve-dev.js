const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const MIME = {
  html: 'text/html', css: 'text/css', js: 'application/javascript',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  svg: 'image/svg+xml', ico: 'image/x-icon', woff2: 'font/woff2', woff: 'font/woff'
};
const PORT = process.env.PORT || 3001;
http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  const fp = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = fp.split('.').pop().toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log('NB Tower dev server on port ' + PORT));
