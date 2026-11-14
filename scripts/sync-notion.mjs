#!/usr/bin/env node
/**
 * Pull public Productions from Notion into src/data/productions.json
 * Requires: NOTION_TOKEN, NOTION_DATABASE_ID
 */
import { writeFileSync } from 'node:fs';
import notionSdk from '@notionhq/client';

const { Client } = notionSdk;

const token = process.env.NOTION_TOKEN;
const databaseId = process.env.NOTION_DATABASE_ID || '418c74f68d3081dba87ac9321202a50d';

if (!token) {
  console.log('NOTION_TOKEN missing — keeping seed productions.json');
  process.exit(0);
}

const notion = new Client({ auth: token });

function plain(rich) {
  if (!rich) return '';
  if (typeof rich === 'string') return rich;
  return rich.map((t) => t.plain_text).join('');
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

// Notion API 2025-09-03+: databases are queried through their data sources.
const database = await notion.databases.retrieve({ database_id: databaseId });
const dataSourceId = database.data_sources?.[0]?.id;
if (!dataSourceId) {
  throw new Error(`No data source found for database ${databaseId}`);
}

const pages = [];
let cursor;
do {
  const res = await notion.dataSources.query({
    data_source_id: dataSourceId,
    start_cursor: cursor,
    filter: { property: 'Public', checkbox: { equals: true } },
  });
  pages.push(...res.results.filter((r) => r.object === 'page'));
  cursor = res.has_more ? res.next_cursor : undefined;
} while (cursor);

const productions = pages.map((page) => {
  const p = page.properties;
  const title = plain(p.Title?.title);
  const cover = p.Cover?.files?.[0];
  const coverUrl = cover?.file?.url || cover?.external?.url || null;
  return {
    slug: plain(p.Slug?.rich_text) || slugify(title),
    title,
    client: plain(p.Client?.rich_text) || '',
    type: p.Type?.select?.name || 'CD',
    date: p.Date?.date?.start || null,
    year: p.Year?.select?.name || null,
    ensemble: plain(p.Ensemble?.rich_text) || null,
    conductor: plain(p.Conductor?.rich_text) || null,
    soloists: plain(p.Soloists?.rich_text) || null,
    roles: (p.Role?.multi_select || []).map((r) => r.name),
    shortText: plain(p['Short text']?.rich_text) || '',
    listenUrl: p['Listen URL']?.url || null,
    infoUrl: p['Info URL']?.url || null,
    coverUrl,
    public: Boolean(p.Public?.checkbox),
    projectNo: plain(p['Project no']?.rich_text) || null,
    source: p.Source?.select?.name || 'manual',
  };
});

writeFileSync(
  new URL('../src/data/productions.json', import.meta.url),
  JSON.stringify(productions, null, 2) + '\n',
);
console.log(`Synced ${productions.length} productions from Notion`);
