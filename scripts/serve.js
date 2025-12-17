#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = parseInt(process.env.PORT || '8080', 10);
const root = process.cwd();

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain'
};

const server = http.createServer((req, res) => {
  try {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let filePath = path.join(root, urlPath);
    if (filePath.endsWith(path.sep)) filePath = path.join(filePath, 'index.html');
    // Prevent directory traversal
    if (!filePath.startsWith(root)) {
      res.statusCode = 403;
      return res.end('Forbidden');
    }

    fs.stat(filePath, (err, st) => {
      if (err) {
        res.statusCode = 404;
        return res.end('Not found');
      }
      if (st.isDirectory()) filePath = path.join(filePath, 'index.html');
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mime[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      const stream = fs.createReadStream(filePath);
      stream.on('error', () => { res.statusCode = 500; res.end('Server error'); });
      stream.pipe(res);
    });
  } catch (e) {
    res.statusCode = 500; res.end('Server error');
  }
});

server.on('listening', () => {
  console.log(`Serving ${root} at http://127.0.0.1:${port}/`);
});

server.on('error', (err) => {
  console.error('Server error:', err.message);
  process.exit(1);
});

server.listen(port, '0.0.0.0');
