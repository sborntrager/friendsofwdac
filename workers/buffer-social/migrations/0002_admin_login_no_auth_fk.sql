-- Friends of WDAC: social posting signs in with the existing admin login, not magic-link auth.
-- created_by now holds the admin's email address (plain text), so the foreign keys from
-- created_by to auth_users(id) in 0001 must go: D1 enforces foreign keys, and an email is never an
-- auth_users id, so every draft or upload would be refused.
--
-- SQLite cannot drop a foreign key in place, so the five tables are recreated without them.
-- That is only safe while they are empty (the Buffer worker had not been deployed). The guard
-- below aborts this migration, changing nothing, if any social data already exists.

CREATE TABLE _social_migration_guard (ok INTEGER NOT NULL CHECK (ok = 1));
INSERT INTO _social_migration_guard (ok)
  SELECT CASE WHEN (SELECT COUNT(*) FROM buffer_social_posts)
                 + (SELECT COUNT(*) FROM buffer_social_media)
                 + (SELECT COUNT(*) FROM buffer_social_post_targets)
                 + (SELECT COUNT(*) FROM buffer_social_publish_logs) = 0 THEN 1 ELSE 0 END;
DROP TABLE _social_migration_guard;

-- buffer_social_channels is untouched: it has no auth foreign key and may hold synced channels.
DROP TABLE buffer_social_publish_logs;
DROP TABLE buffer_social_post_targets;
DROP TABLE buffer_social_posts;
DROP TABLE buffer_social_media;

CREATE TABLE buffer_social_media (
  id TEXT PRIMARY KEY,
  r2_key TEXT NOT NULL UNIQUE,
  public_url TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_buffer_social_media_created
  ON buffer_social_media(created_at DESC);

CREATE TABLE buffer_social_posts (
  id TEXT PRIMARY KEY,
  title TEXT,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved', 'publishing', 'queued', 'failed')),
  media_id TEXT REFERENCES buffer_social_media(id) ON DELETE SET NULL,
  scheduled_for TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_buffer_social_posts_status_time
  ON buffer_social_posts(status, created_at DESC);

CREATE TABLE buffer_social_post_targets (
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

CREATE TABLE buffer_social_publish_logs (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES buffer_social_posts(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL REFERENCES buffer_social_channels(id) ON DELETE RESTRICT,
  status TEXT NOT NULL,
  buffer_response_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_buffer_social_publish_logs_post
  ON buffer_social_publish_logs(post_id, created_at DESC);
