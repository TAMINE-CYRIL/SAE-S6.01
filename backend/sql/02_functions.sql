-- ─── Frugal AI — Fonctions SQL (RPC PostgREST) ───────────────────────────────────
-- À exécuter après 01_schema.sql

-- ─── Recherche RAG : top-K chunks par similarité cosinus ──────────────────────
CREATE OR REPLACE FUNCTION match_chunks(
    query_embedding VECTOR(768),
    match_count     INT DEFAULT 5
)
RETURNS TABLE (
    id          UUID,
    contenu     TEXT,
    source_pdf  TEXT,
    similarity  FLOAT
)
LANGUAGE sql STABLE
AS $$
    SELECT
        id,
        contenu,
        source_pdf,
        1 - (embedding <=> query_embedding) AS similarity
    FROM chunks
    ORDER BY embedding <=> query_embedding
    LIMIT match_count;
$$;

-- ─── Résumé d'une session (utilisé par le replay) ─────────────────────────────
CREATE OR REPLACE FUNCTION get_session_replay(p_session_id UUID)
RETURNS JSON
LANGUAGE plpgsql STABLE
AS $$
DECLARE
    v_session   JSON;
    v_messages  JSON;
    v_scores    JSON;
    v_profil    TEXT;
    v_score     INTEGER;
BEGIN
    SELECT row_to_json(s) INTO v_session
    FROM sessions s
    WHERE s.id = p_session_id;

    SELECT json_agg(m ORDER BY m.tour ASC) INTO v_messages
    FROM messages m
    WHERE m.session_id = p_session_id;

    SELECT json_agg(sc ORDER BY sc.question_id ASC) INTO v_scores
    FROM scores sc
    WHERE sc.session_id = p_session_id;

    SELECT score_final INTO v_score
    FROM sessions
    WHERE id = p_session_id;

    v_profil := CASE
        WHEN v_score BETWEEN 24 AND 42 THEN 'Souveraineté et sobriété radicales'
        WHEN v_score BETWEEN 43 AND 60 THEN 'Régulation et changement de cap'
        WHEN v_score BETWEEN 61 AND 78 THEN 'Pragmatisme et mix équilibré'
        WHEN v_score BETWEEN 79 AND 96 THEN 'Confiance technologique et innovation'
        ELSE 'Non défini'
    END;

    RETURN json_build_object(
        'session',    v_session,
        'messages',   COALESCE(v_messages, '[]'::json),
        'scores',     COALESCE(v_scores,   '[]'::json),
        'score_final', v_score,
        'profil',     v_profil
    );
END;
$$;

-- Accorder les droits sur les fonctions à anon et service_role
GRANT EXECUTE ON FUNCTION match_chunks(VECTOR(768), INT)        TO anon, service_role;
GRANT EXECUTE ON FUNCTION get_session_replay(UUID)              TO anon, service_role;

-- Accorder les droits CRUD sur les tables
GRANT SELECT, INSERT, UPDATE, DELETE ON sessions TO anon, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO anon, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON scores   TO anon, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON chunks   TO anon, service_role;
