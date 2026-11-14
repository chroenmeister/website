# christoph.roennecke.eu

English-only Tonmeister site for ensembles and soloists. Built with Astro, published via GitHub Pages.

## Content

- Notion database **Productions** (source of truth): https://www.notion.so/418c74f68d3081dba87ac9321202a50d
- Seed fallback: `src/data/productions.json`

## Local

```bash
npm ci
npm run dev
npm run build
npm run preview
```

## Sync

```bash
export NOTION_TOKEN=...
export NOTION_DATABASE_ID=418c74f68d3081dba87ac9321202a50d
npm run sync:notion

export IG_ACCESS_TOKEN=...
export IG_USER_ID=...
npm run sync:instagram

# Push remaining seed rows into Notion
node scripts/migrate-seed-to-notion.mjs
```

## Deploy

GitHub Actions workflow `.github/workflows/publish.yml` builds nightly and on push to `main`, then deploys to Pages.
