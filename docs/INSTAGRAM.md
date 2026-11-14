# Instagram feed setup

The old Basic Display API is gone. Use **Instagram API with Instagram Login**.

## Once

1. Confirm `@tonmeister.roennecke` is a Professional account (Creator/Business).
2. Create a Meta app → add Instagram product → Instagram API with Instagram Login.
3. Permissions: `instagram_business_basic`.
4. Complete OAuth for your own account, exchange for a long-lived token (~60 days).
5. Resolve your Instagram user id (`/me?fields=user_id`).

## Secrets (GitHub Actions)

- `IG_ACCESS_TOKEN`
- `IG_USER_ID`

## Renewal (chosen: manual)

Every ~50 days refresh the token:

```bash
curl "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=$IG_ACCESS_TOKEN"
```

Update the GitHub secret with the new value:

```bash
gh secret set IG_ACCESS_TOKEN --repo chroenmeister/website
```

The nightly build also attempts a refresh and prints a reminder when it succeeds; Actions cannot overwrite secrets by itself without an extra PAT.
