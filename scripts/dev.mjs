// Yerel önizleme: siteyi derler ve dist/ klasörünü http://localhost:3000 adresinde sunar.
// Kaynak dosyalar değişince yeniden derler (sayfayı elle yenileyin).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { watch } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const port = Number(process.env.PORT) || 3000;

const build = () => spawnSync(process.execPath, ['build.mjs'], { cwd: root, stdio: 'inherit' });
build();

let timer;
for (const p of ['src', 'site.config.mjs', 'build.mjs']) {
  try {
    watch(join(root, p), { recursive: true }, () => {
      clearTimeout(timer);
      timer = setTimeout(build, 150);
    });
  } catch {}
}

const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json',
};

const find = async (path) => {
  for (const c of [path, path + '.html', join(path, 'index.html')]) {
    try { if ((await stat(c)).isFile()) return c; } catch {}
  }
  return null;
};

createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const safe = normalize(url).replace(/^(\.\.[/\\])+/, '');
  let file = await find(join(dist, safe));
  let status = 200;
  if (!file) { file = join(dist, '404.html'); status = 404; }
  try {
    const body = await readFile(file);
    res.writeHead(status, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`\nÖnizleme: http://localhost:${port}`));
