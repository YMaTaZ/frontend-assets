/**
 * 本地静态服务器（零依赖，只要 Node）。
 *   node serve.mjs         → http://127.0.0.1:8100/
 *   node serve.mjs 9000    → 换端口
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.argv[2]) || 8100;
const ROOT = resolve(fileURLToPath(new URL('./', import.meta.url)));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp'
};

const send = (res, code, body, type = 'text/plain; charset=utf-8') => {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
  res.end(body);
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';

    const target = normalize(join(ROOT, pathname));
    if (!target.startsWith(ROOT + sep) && target !== ROOT) return send(res, 403, 'Forbidden');

    const info = await stat(target).catch(() => null);
    if (!info || !info.isFile()) return send(res, 404, `Not found: ${pathname}`);

    const body = await readFile(target);
    res.writeHead(200, {
      'Content-Type': MIME[extname(target).toLowerCase()] || 'application/octet-stream',
      'Content-Length': body.length,
      'Cache-Control': 'no-cache'
    });
    res.end(body);
  } catch (err) {
    send(res, 500, `Server error: ${err.message}`);
  }
}).listen(PORT, '127.0.0.1', () => {
  console.log(`frontend-assets: http://127.0.0.1:${PORT}/`);
  console.log(`root: ${ROOT}`);
});
