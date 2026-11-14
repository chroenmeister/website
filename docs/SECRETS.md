# Secrets and rotation

## GitHub Actions (`chroenmeister/website`)

| Secret | Purpose |
| --- | --- |
| `NOTION_TOKEN` | Internal Notion integration with access to Productions |
| `NOTION_DATABASE_ID` | `418c74f68d3081dba87ac9321202a50d` |
| `IG_ACCESS_TOKEN` | Instagram long-lived user token |
| `IG_USER_ID` | Instagram professional account id |

Set with:

```bash
gh secret set NOTION_TOKEN --repo chroenmeister/website
gh secret set NOTION_DATABASE_ID --repo chroenmeister/website --body 418c74f68d3081dba87ac9321202a50d
gh secret set IG_ACCESS_TOKEN --repo chroenmeister/website
gh secret set IG_USER_ID --repo chroenmeister/website
```

Values are entered interactively — never paste tokens into chat or commit them.

## IONOS server (manual)

Rotate now (still used by live TYPO3 until cutover, and by leftover compose files):

1. MySQL password in `/srv/docker/website/live/docker-compose.yml` and `stage/docker-compose.yml` (same password today).
2. SSH build-arg password in `/srv/docker/website/stage/Dockerfile`.
3. Old GitLab tokens in archived `hosts.yml` — discard, do not import into GitHub.
