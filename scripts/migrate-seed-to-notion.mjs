#!/usr/bin/env node
/**
 * Upsert src/data/productions.json into the Notion Productions database.
 * Requires NOTION_TOKEN. Safe to re-run: skips existing slugs.
 */
import { readFileSync } from 'node:fs';
import notionSdk from '@notionhq/client';

const { Client } = notionSdk;
const token = process.env.NOTION_TOKEN;
const databaseId = process.env.NOTION_DATABASE_ID || '418c74f68d3081dba87ac9321202a50d';

if (!token) {
  console.error('NOTION_TOKEN required');
  process.exit(1);
}

const notion = new Client({ auth: token });
const seed = JSON.parse(readFileSync(new URL('../src/data/productions.json', import.meta.url), 'utf8'));

const existing = new Set();
let cursor;
do {
  const res = await notion.databases.query({ database_id: databaseId, start_cursor: cursor });
  for (const page of res.results) {
    const slug = (page.properties.Slug?.rich_text || []).map((t) => t.plain_text).join('');
    if (slug) existing.add(slug);
  }
  cursor = res.has_more ? res.next_cursor : undefined;
} while (cursor);

let created = 0;
for (const p of seed) {
  if (existing.has(p.slug)) continue;
  const properties = {
    Title: { title: [{ text: { content: p.title } }] },
    Client: { rich_text: [{ text: { content: p.client || '' } }] },
    Type: { select: { name: p.type } },
    Ensemble: { rich_text: [{ text: { content: p.ensemble || '' } }] },
    Soloists: { rich_text: [{ text: { content: p.soloists || '' } }] },
    Role: { multi_select: (p.roles || []).map((name) => ({ name })) },
    'Short text': { rich_text: [{ text: { content: (p.shortText || '').slice(0, 1900) } }] },
    Public: { checkbox: Boolean(p.public) },
    Slug: { rich_text: [{ text: { content: p.slug } }] },
    Source: { select: { name: p.source === 'MDR' || p.source === 'TYPO3' || p.source === 'manual' ? p.source : 'manual' } },
  };
  if (p.year) properties.Year = { select: { name: String(p.year) } };
  if (p.listenUrl) properties['Listen URL'] = { url: p.listenUrl };
  if (p.infoUrl) properties['Info URL'] = { url: p.infoUrl };
  if (p.projectNo) properties['Project no'] = { rich_text: [{ text: { content: p.projectNo } }] };
  if (p.date) properties.Date = { date: { start: p.date } };
  if (p.source === 'MDR') properties['MDR status'] = { select: { name: 'found' } };

  await notion.pages.create({ parent: { database_id: databaseId }, properties });
  created += 1;
  console.log('created', p.slug);
}

console.log(`Done. Created ${created}, skipped ${seed.length - created}.`);
