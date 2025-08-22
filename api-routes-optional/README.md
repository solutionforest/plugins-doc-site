# Optional API Routes for Server Deployment

If you later decide to deploy to a server (Vercel, Netlify, etc.) instead of GitHub Pages, these API routes can be moved to `app/api/` to enable webhook functionality.

## Files included:

- `rebuild/route.ts` - Webhook endpoint for triggering rebuilds
- `status/route.ts` - Status endpoint for health checks

## To enable:

1. Copy the entire `api-routes-optional` folder to `app/api`
2. Deploy to a server platform (not GitHub Pages)
3. Configure webhooks in your plugin repositories

## Note:

These API routes **do not work** with GitHub Pages static hosting. They are only for server-based deployments where you need automatic rebuild functionality via webhooks.
