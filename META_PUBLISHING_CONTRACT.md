# Meta publishing backend contract

The frontend should never store Facebook/Instagram access tokens.

## GET /api/meta/connections
Returns:
```json
{
  "instagram": { "connected": true, "accountName": "...", "accountId": "..." },
  "facebook": { "connected": true, "pageName": "...", "pageId": "..." }
}
```

## GET /api/meta/connect/instagram
Starts server-side OAuth and redirects back to the app when complete.

## GET /api/meta/connect/facebook
Starts server-side OAuth and redirects back to the app when complete.

## POST /api/meta/publish
Request:
```json
{
  "target": "instagram",
  "assetUrl": "https://public-or-signed-media-url/...jpg",
  "caption": "Match day...",
  "mediaType": "IMAGE"
}
```

Response:
```json
{
  "ok": true,
  "platformPostId": "...",
  "permalink": "..."
}
```

## Required server responsibilities
- OAuth callback handling.
- Permission/app-review checks.
- Secure token encryption/storage and refresh.
- Converting exported browser files into public/signed media URLs where required.
- Creating/polling/publishing Instagram media containers.
- Publishing Facebook Page photos/videos/posts.
- Rate-limit handling, retries, audit logs, and user-visible errors.

Never expose page access tokens or Instagram access tokens via `VITE_*` variables.
