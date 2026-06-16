-- ============================================================
-- Recrutaê — Supabase: tabela de buscas de candidatos
-- Execute no SQL Editor: supabase.com/dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS candidate_searches (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  contact_name     TEXT        NOT NULL,
  contact_email    TEXT        NOT NULL,
  contact_phone    TEXT,
  contact_role     TEXT,
  company_name     TEXT,
  audio_transcript TEXT,
  text_answers     JSONB,
  job_description  JSONB,
  candidate_count  INTEGER,
  status           TEXT        DEFAULT 'new'
    CHECK (status IN ('new','contacted','converted','disqualified'))
);

-- Índices úteis para o painel de recrutadores
CREATE INDEX IF NOT EXISTS idx_cs_created  ON candidate_searches (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cs_status   ON candidate_searches (status);
CREATE INDEX IF NOT EXISTS idx_cs_company  ON candidate_searches (company_name);

-- Row Level Security: apenas a Edge Function (service role) pode ler/inserir
ALTER TABLE candidate_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "edge_function_full_access" ON candidate_searches
  FOR ALL
  USING     (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================
-- Recrutaê — Supabase: leads do formulário "Entre em contato"
-- ============================================================

CREATE TABLE IF NOT EXISTS contact_leads (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  name         TEXT        NOT NULL,
  email        TEXT        NOT NULL,
  phone        TEXT,
  company      TEXT,
  role         TEXT,
  country      TEXT,
  types        TEXT[],
  source_page  TEXT,
  status       TEXT        DEFAULT 'new'
    CHECK (status IN ('new','contacted','converted','disqualified'))
);

CREATE INDEX IF NOT EXISTS idx_cl_created ON contact_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cl_status  ON contact_leads (status);

ALTER TABLE contact_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "edge_function_full_access" ON contact_leads
  FOR ALL
  USING     (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Admin autenticado (painel) pode ler e atualizar status
CREATE POLICY "auth_select" ON contact_leads
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_update" ON contact_leads
  FOR UPDATE USING (auth.role() = 'authenticated');
