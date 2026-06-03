-- ─── Frugal AI — Schéma base de données ─────────────────────────────────────────
-- À exécuter dans Supabase Studio (http://localhost:3000) > SQL Editor

-- Extension pgvector (obligatoire)
CREATE EXTENSION IF NOT EXISTS vector;

-- ─── Table sessions ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    role            TEXT        NOT NULL,
    modele_standard TEXT        NOT NULL,
    date_debut      TIMESTAMPTZ DEFAULT NOW(),
    date_fin        TIMESTAMPTZ,
    score_final     INTEGER,
    statut          TEXT        DEFAULT 'en_cours'
                                CHECK (statut IN ('en_cours', 'terminee'))
);

-- ─── Table messages ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  UUID        NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    tour        INTEGER     NOT NULL,
    auteur      TEXT        NOT NULL CHECK (auteur IN ('frugaliste', 'standard')),
    contenu     TEXT        NOT NULL,
    timestamp   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_tour       ON messages(session_id, tour);

-- ─── Table scores ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scores (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  UUID    NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL CHECK (question_id BETWEEN 1 AND 24),
    reponse     TEXT,
    points      INTEGER CHECK (points BETWEEN 1 AND 4),
    timestamp   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (session_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_scores_session_id ON scores(session_id);

-- ─── Table chunks (RAG) ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chunks (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    contenu     TEXT    NOT NULL,
    embedding   VECTOR(768) NOT NULL,
    source_pdf  TEXT,
    metadata    JSONB
);

-- Index IVFFlat pour la recherche par similarité cosinus
CREATE INDEX IF NOT EXISTS idx_chunks_embedding
    ON chunks
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
