import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { stat } from 'node:fs/promises';
const root = path.resolve('out');
const port = Number(process.env.PORT || 4173);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};
http
  .createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      let file = path.resolve(root, `.${pathname}`);
      if (!file.startsWith(root + path.sep) && file !== root) {
        res.writeHead(403).end();
        return;
      }
      let status = 200;
      try {
        const info = await stat(file);
        if (info.isDirectory()) file = path.join(file, 'index.html');
        await stat(file);
      } catch {
        file = path.join(root, '404.html');
        status = 404;
      }
      res.writeHead(status, {
        'Content-Type': mime[path.extname(file)] || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
      });
      if (req.method === 'HEAD') {
        res.end();
        return;
      }
      fs.createReadStream(file).pipe(res);
    } catch {
      res.writeHead(400).end('Bad request');
    }
  })
  .listen(port, '127.0.0.1', () => console.log(`Production preview: http://localhost:${port}`));
