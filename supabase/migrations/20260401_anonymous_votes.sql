-- Migración: tabla anonymous_votes
-- Ejecutar en Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS public.anonymous_votes (
  id               SERIAL PRIMARY KEY,
  poll_id          INTEGER NOT NULL REFERENCES public.themes(id) ON DELETE CASCADE,
  client_token     TEXT NOT NULL,
  ip_hash          TEXT,
  fingerprint_hash TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT anonymous_votes_unique_token UNIQUE (poll_id, client_token)
);

CREATE INDEX IF NOT EXISTS idx_anonymous_votes_ip
  ON public.anonymous_votes (poll_id, ip_hash);

CREATE INDEX IF NOT EXISTS idx_anonymous_votes_fingerprint
  ON public.anonymous_votes (poll_id, fingerprint_hash);

ALTER TABLE public.anonymous_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anonymous_votes_service_only" ON public.anonymous_votes
  USING (false);

GRANT ALL ON public.anonymous_votes TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.anonymous_votes_id_seq TO service_role;
