-- ============================================================
--  RiderDash — Schema Supabase (PostgreSQL)
--  Esegui questo SQL in: Supabase → SQL Editor → New Query
-- ============================================================

-- ── Riders (utenti) ─────────────────────────────────────────
CREATE TABLE riders (
  id           SERIAL PRIMARY KEY,
  username     VARCHAR(50)  UNIQUE NOT NULL,
  email        VARCHAR(150) UNIQUE NOT NULL,
  nome         VARCHAR(80)  NOT NULL,
  cognome      VARCHAR(80)  NOT NULL,
  password_hash TEXT        NOT NULL,
  abbonamento  VARCHAR(20)  NOT NULL DEFAULT 'STANDARD',
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Giornate lavorative ──────────────────────────────────────
CREATE TABLE giornate (
  id                 SERIAL PRIMARY KEY,
  id_rider           INTEGER NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
  datag              DATE    NOT NULL,
  giorno             VARCHAR(20) NOT NULL,
  numero_ordini      INTEGER NOT NULL DEFAULT 0,
  ordini_consegnati  NUMERIC(10,2) NOT NULL DEFAULT 0,
  incentivi          NUMERIC(10,2) NOT NULL DEFAULT 0,
  mance              NUMERIC(10,2) NOT NULL DEFAULT 0,
  contanti           NUMERIC(10,2) NOT NULL DEFAULT 0,
  benzina            NUMERIC(10,2) NOT NULL DEFAULT 0,
  km                 NUMERIC(8,1)  NOT NULL DEFAULT 0,
  luogo              VARCHAR(100) NOT NULL DEFAULT '',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_giornate_rider_data ON giornate(id_rider, datag);

-- ── Guadagni mensili aggregati ───────────────────────────────
-- Questa tabella viene popolata da "Crea Mese" (come nel PHP originale)
CREATE TABLE guadagni (
  id         SERIAL PRIMARY KEY,
  id_rider   INTEGER NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
  anno       INTEGER NOT NULL,
  mese       INTEGER NOT NULL CHECK (mese BETWEEN 1 AND 12),
  fatturato  NUMERIC(10,2) NOT NULL DEFAULT 0,
  ordini     INTEGER       NOT NULL DEFAULT 0,
  bonifico   NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE(id_rider, anno, mese)
);

CREATE INDEX idx_guadagni_rider_anno ON guadagni(id_rider, anno);

-- ── Row Level Security (RLS) ─────────────────────────────────
-- Blocca accesso diretto alle tabelle dall'esterno
ALTER TABLE riders   ENABLE ROW LEVEL SECURITY;
ALTER TABLE giornate ENABLE ROW LEVEL SECURITY;
ALTER TABLE guadagni ENABLE ROW LEVEL SECURITY;

-- Le API Next.js usano service_role_key → bypassa RLS automaticamente
-- Nessuna policy pubblica necessaria
