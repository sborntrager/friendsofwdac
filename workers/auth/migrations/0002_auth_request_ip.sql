-- Per-IP sign-in request limit. Rows written before this migration have no ip_hash.
ALTER TABLE auth_request_log ADD COLUMN ip_hash TEXT;
CREATE INDEX IF NOT EXISTS idx_auth_request_log_ip_time
  ON auth_request_log(ip_hash, requested_at);
CREATE INDEX IF NOT EXISTS idx_auth_magic_links_created
  ON auth_magic_links(created_at);
