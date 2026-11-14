# Concept lock — Tonmeister card

## Audience
Ensembles and soloists planning a CD or video production.

## Positioning
Broadcast quality (MDR, rbb) at freelancer pace, score-led sessions, proven names.

## Layout
**Listen first** — dark control-room look, hero video, six featured productions, process, Instagram strip, contact.

## Language
English only (except Impressum + Privacy in German).

## Location
Leipzig (not Berlin).

## Data
Notion database **Productions** under Tonmeister Projekte:
https://www.notion.so/418c74f68d3081dba87ac9321202a50d

Seed JSON in `src/data/productions.json` mirrors that model for builds without a token.

## Instagram token renewal
Manual every ~50 days (option c). Scripts document refresh; optional `IG_TOKEN_REFRESH_PAT` can write the secret later.

## Hosting
Public GitHub repo + GitHub Pages. No stage. Nightly `schedule` + `workflow_dispatch`. Keepalive commit optional; external cron may call `workflow_dispatch`.

## Quotes
Not yet collected — omit until real artist quotes exist.
