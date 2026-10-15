import fs from 'node:fs';
import path from 'node:path';

async function install() {
  const targetDirs = [
    'C:/Users/LENOVO/.gemini/config/skills/using-superpowers',
    'C:/Users/LENOVO/.gemini/config/skills/using-superpower'
  ];

  const headers = { 'User-Agent': 'Antigravity-Agent' };

  async function fetchJson(url) {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    return res.json();
  }

  console.log('Fetching using-superpowers contents from GitHub (obra/superpowers)...');
  const rootItems = await fetchJson('https://api.github.com/repos/obra/superpowers/contents/skills/using-superpowers');

  for (const item of rootItems) {
    if (item.type === 'file') {
      const fileData = await fetchJson(item.url);
      const content = Buffer.from(fileData.content, 'base64').toString('utf8');
      for (const dir of targetDirs) {
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, item.name), content, 'utf8');
      }
      console.log('Installed:', item.name);
    } else if (item.type === 'dir' && item.name === 'references') {
      const refItems = await fetchJson(item.url);
      for (const ref of refItems) {
        if (ref.type === 'file') {
          const fileData = await fetchJson(ref.url);
          const content = Buffer.from(fileData.content, 'base64').toString('utf8');
          for (const dir of targetDirs) {
            const refDir = path.join(dir, 'references');
            fs.mkdirSync(refDir, { recursive: true });
            fs.writeFileSync(path.join(refDir, ref.name), content, 'utf8');
          }
          console.log('Installed references/' + ref.name);
        }
      }
    }
  }
  console.log('Successfully installed using-superpowers and using-superpower!');
}

install().catch((err) => {
  console.error('Installation failed:', err);
  process.exit(1);
});
