# Cutover checklist

## Before DNS

1. Enable GitHub Pages for `chroenmeister/website` (Settings → Pages → Source: GitHub Actions).
2. Set secrets: `NOTION_TOKEN`, `NOTION_DATABASE_ID`, `IG_ACCESS_TOKEN`, `IG_USER_ID`.
3. Run workflow `Publish site` once; confirm https://chroenmeister.github.io/website/ or the Pages URL works.
4. Complete Impressum postal address.
5. Rotate MySQL password in `/srv/docker/website/*/docker-compose.yml` and SSH build-arg in stage Dockerfile (on IONOS).

## DNS

Point `christoph.roennecke.eu` to GitHub Pages:

- Apex: A records to GitHub Pages IPs, or ALIAS/ANAME if the DNS host supports it.
- Or CNAME `www` → `chroenmeister.github.io` and redirect apex → www.

In repo, `public/CNAME` already contains `christoph.roennecke.eu`.

## After DNS

1. Stop TYPO3 stacks on IONOS (`/srv/docker/website/live` and `stage`).
2. Drop or archive `stage.roennecke.eu`.
3. Keep IONOS for Nextcloud/mail/accounting.
4. Optional keepalive: cron on IONOS calling `workflow_dispatch` so the public-repo schedule is never paused after 60 days of inactivity.
