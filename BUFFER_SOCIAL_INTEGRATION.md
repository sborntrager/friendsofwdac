# Buffer social operations

Friends of WDAC now exposes the reusable Buffer social-operations module through
`workers/buffer-social/src/index.js`. The small `index.js` integration entry
also imports that Worker for local verification. It originated in the shared
`../../Modules/buffer-social-operations` library. Its worker and migration are
vendored in this site because Cloudflare's bundler cannot import source outside
the site directory; update both locations together when upgrading the module.

The worker provides protected endpoints for syncing Buffer channels, uploading
social media, drafting posts, approval, scheduling, and publishing. It is kept
separate from the existing subscription/admin worker to avoid changing that
worker's current KV-based authentication or deployment.

## Required setup before deployment

1. Install and deploy `cloudflare-magic-link-auth` on the same site origin. Its
   `auth_users` and `auth_sessions` D1 tables are required; users who manage
   social posts need the `editor` or `admin` role.
2. Create a D1 database and R2 bucket in the Friends of WDAC Cloudflare account.
   Replace the `replace-with-...` values in `wrangler.buffer-social.toml`.
3. Give the R2 bucket a public custom domain and put its HTTPS URL in
   `PUBLIC_MEDIA_BASE_URL`.
4. Set the Buffer API key only as a Worker secret:
   `npx wrangler secret put BUFFER_API_KEY --config wrangler.buffer-social.toml`.
5. Apply the Buffer migration after the auth migrations, then deploy:
   `npx wrangler d1 migrations apply DB --remote --config wrangler.buffer-social.toml`
   and `npx wrangler deploy --config wrangler.buffer-social.toml`.

Route the deployed worker on the site origin for `/api/admin/buffer/*`,
`/api/admin/media*`, and `/api/admin/social-posts*`. Do not place the Buffer
key in this repository or in `wrangler.buffer-social.toml`.

## Verification

Run `node scripts/verify-buffer-social.mjs` from `site`. It imports the worker
through Friends of WDAC's integration entry point and confirms its health guard
rejects use until the required bindings and secret are configured. The shared
module's complete unit suite can be run from `../../Modules/buffer-social-operations`
with `npm test`.
