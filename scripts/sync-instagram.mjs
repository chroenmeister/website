#!/usr/bin/env node
/**
 * Fetch recent Instagram media and store locally.
 * Requires IG_USER_ID + IG_ACCESS_TOKEN (Instagram API with Instagram Login).
 * Token refresh: run with IG_ACCESS_TOKEN; optionally set IG_APP_SECRET.
 * Manual renewal every ~50 days if refresh is not automated.
 */
import { mkdirSync, writeFileSync, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const token = process.env.IG_ACCESS_TOKEN;
const userId = process.env.IG_USER_ID;
const root = dirname(fileURLToPath(import.meta.url));
const outDir = join(root, '../public/instagram');
const outJson = join(root, '../src/data/instagram.json');

if (!token || !userId) {
  console.log('IG_ACCESS_TOKEN / IG_USER_ID missing — leaving empty Instagram feed');
  writeFileSync(outJson, '[]\n');
  process.exit(0);
}

async function refreshToken(current) {
  const url = new URL('https://graph.instagram.com/refresh_access_token');
  url.searchParams.set('grant_type', 'ig_refresh_token');
  url.searchParams.set('access_token', current);
  const res = await fetch(url);
  if (!res.ok) {
    console.warn('Token refresh failed', await res.text());
    return current;
  }
  const data = await res.json();
  if (data.access_token) {
    console.log('Refreshed Instagram long-lived token; update the IG_ACCESS_TOKEN secret manually.');
    return data.access_token;
  }
  return current;
}

const accessToken = await refreshToken(token);
mkdirSync(outDir, { recursive: true });

const mediaUrl = new URL(`https://graph.instagram.com/v21.0/${userId}/media`);
mediaUrl.searchParams.set('fields', 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp');
mediaUrl.searchParams.set('access_token', accessToken);
mediaUrl.searchParams.set('limit', '8');

const mediaRes = await fetch(mediaUrl);
if (!mediaRes.ok) {
  console.error('Instagram media fetch failed', await mediaRes.text());
  writeFileSync(outJson, '[]\n');
  process.exit(0);
}

const media = await mediaRes.json();
const posts = [];

for (const item of media.data || []) {
  const imageUrl = item.thumbnail_url || item.media_url;
  if (!imageUrl) continue;
  const fileName = `${item.id}.jpg`;
  const localPath = `/instagram/${fileName}`;
  try {
    const imgRes = await fetch(imageUrl);
    if (imgRes.ok && imgRes.body) {
      await pipeline(Readable.fromWeb(imgRes.body), createWriteStream(join(outDir, fileName)));
    }
  } catch (err) {
    console.warn('Failed to download', item.id, err.message);
  }
  posts.push({
    id: item.id,
    caption: item.caption || '',
    permalink: item.permalink,
    mediaType: item.media_type,
    timestamp: item.timestamp,
    localPath,
  });
}

writeFileSync(outJson, JSON.stringify(posts, null, 2) + '\n');
console.log(`Synced ${posts.length} Instagram posts`);
