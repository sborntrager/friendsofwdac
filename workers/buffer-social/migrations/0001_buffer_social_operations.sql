-- buffer-social-operations schema.
-- Every table uses the buffer_social_ prefix so the module can be installed into a
-- D1 database that already holds older, unprefixed buffer_channels / social_posts /
-- social_post_targets / media_assets / publish_logs tables. Those tables are not read
-- or changed here. Requires the cloudflare-magic-link-auth tables (auth_users,
-- auth_sessions) in the same database.

CREATE TABLE IF NOT EXISTS buffer_social_channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  service TEXT,
  raw_json TEXT,
  synced_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS buffer_social_media (
  id TEXT PRIMARY KEY,
  r2_key TEXT NOT NULL UNIQUE,
  public_url TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_by TEXT REFERENCES auth_users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_buffer_social_media_created
  ON buffer_social_media(created_at DESC);

CREATE TABLE IF NOT EXISTS buffer_social_posts (
  id TEXT PRIMARY KEY,
  title TEXT,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved', 'publishing', 'queued', 'failed')),
  media_id TEXT REFERENCES buffer_social_media(id) ON DELETE SET NULL,
  scheduled_for TEXT,
  created_by TEXT REFERENCES auth_users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_buffer_social_posts_status_time
  ON buffer_social_posts(status, created_at DESC);

CREATE TABLE IF NOT EXISTS buffer_social_post_targets (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES buffer_social_posts(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL REFERENCES buffer_social_channels(id) ON DELETE RESTRICT,
  buffer_post_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'publishing', 'queued', 'failed')),
  error_message TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, channel_id)
);

CREATE TABLE IF NOT EXISTS buffer_social_publish_logs (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES buffer_social_posts(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL REFERENCES buffer_social_channels(id) ON DELETE RESTRICT,
  status TEXT NOT NULL,
  buffer_response_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_buffer_social_publish_logs_post
  ON buffer_social_publish_logs(post_id, created_at DESC);
