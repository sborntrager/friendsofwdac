# Buffer social operations

Admins draft, approve and send social posts from the **Social** tab of `/admin`. Posts go to the
channels connected in Buffer. Nothing is sent until an admin approves the post and then confirms
"Send".

## How it fits together

```
/admin  (Social tab, public/js/admin-social.js)
   |  Bearer token = the normal admin sign-in
   v
api.friendsofwdac.org/admin/social/*   --> friendsofwdac-buffer-social  (workers/buffer-social)
                                              |-- ADMIN_API service binding --> friendsofwdac-subscribe  GET /admin/whoami
                                              |-- D1 `DB`            buffer_social_* tables
                                              |-- R2 `MEDIA_BUCKET`  uploaded photos and videos
                                              '-- Buffer API         BUFFER_API_KEY (Worker secret)
```

- **One sign-in.** The Social worker has no login of its own. It asks the admin API
  (`GET /admin/whoami`, added to `workers/subscribe.js`) whether the request's Bearer token is a live
  admin session. Every approved admin can draft, approve and send. The admin's email is stored as
  `created_by`. The magic-link auth Worker (`wrangler.auth.toml`) is **not** used by social posting.
- **Separate Worker.** Kept apart from `subscribe.js` so a Buffer problem cannot affect sign-in,
  forms or the newsletter. Cloudflare sends only `/admin/social/*` to it (the more specific route
  wins over the subscribe Worker's `api.friendsofwdac.org/*`).
- **Browser CORS.** The admin pages call the API cross-origin, so the Worker answers preflights
  and adds CORS headers for `ALLOWED_ORIGINS` only. Cookies are never used.
- **Health without sign-in.** `GET /admin/social/health` lists any missing setting, and the Social
  tab shows it as a "Setup still needed" checklist until everything is in place.

## Endpoints (all under `/admin/social`, Bearer token required except `health`)

| Method and path | Purpose |
| --- | --- |
| `GET /health` | Config check, no sign-in |
| `GET /channels`, `POST /channels/sync` | List stored channels, pull the list from Buffer |
| `POST /media/upload` | Raw JPEG, PNG, GIF, WebP, MP4 or MOV body (max `MAX_MEDIA_BYTES`, default 10 MB, content checked) |
| `GET /media` | Uploaded files |
| `GET /posts`, `POST /posts` | List posts (`?status=`), save a draft |
| `GET /posts/:id` | Post, per-channel results, publish log |
| `POST /posts/:id/approve` | Draft to approved |
| `POST /posts/:id/publish` | Send to Buffer. Retrying only resends channels that failed |

## Keeping the module in sync

The Worker is vendored from `../../Modules/buffer-social-operations` because Cloudflare's bundler
cannot import code outside the site folder. This copy is **adapted**: sign-in, route paths, CORS,
and a second migration differ from the module. Compare against the module before upgrading it.
Migration `0001` is identical to the module's. `0002` removes its foreign keys to `auth_users`
(see the comments in that file).

## Tests and checks

Run from `site`:

```
node --disable-warning=ExperimentalWarning --test test/social-worker.test.js
node scripts/verify-buffer-social.mjs
```

The tests use `node:sqlite` as a stand-in for D1 and mock Buffer, so they prove the logic, not the
deployed Cloudflare setup. After deploying, do a live check (see `../setup_and_next_steps.md`).

The Social tab was also exercised in a browser against a fake API: setup-needed state, channel sync,
validation, draft, approve, confirm, partial failure with retry, and status filter.
