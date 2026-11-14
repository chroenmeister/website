#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';

const productions = JSON.parse(readFileSync(new URL('../src/data/productions.json', import.meta.url), 'utf8'));

async function ok(url) {
  if (!url) return false;
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (res.ok) return true;
    const get = await fetch(url, { method: 'GET', redirect: 'follow' });
    return get.ok;
  } catch {
    return false;
  }
}

let changed = 0;
for (const p of productions) {
  if (p.listenUrl) {
    const good = await ok(p.listenUrl);
    if (!good) {
      console.warn('Dead listen URL', p.slug, p.listenUrl);
      p.listenUrl = null;
      changed += 1;
    }
  }
  if (p.coverUrl) {
    const good = await ok(p.coverUrl);
    if (!good) {
      console.warn('Dead cover URL', p.slug, p.coverUrl);
      p.coverUrl = null;
      changed += 1;
    }
  }
}

if (changed) {
  writeFileSync(
    new URL('../src/data/productions.json', import.meta.url),
    JSON.stringify(productions, null, 2) + '\n',
  );
}
console.log(`Link check done. Cleared ${changed} broken URLs.`);
