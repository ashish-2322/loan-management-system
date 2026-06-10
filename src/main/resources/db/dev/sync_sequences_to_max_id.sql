-- =============================================================================
-- DEV / TEST — Sync sequences to MAX(id) (does NOT force restart at 1)
-- =============================================================================
--
-- Use when sequences are out of sync with existing data (e.g. manual INSERTs),
-- or after partial deletes. Safe when tables still contain rows.
--
-- Production: normally not required; PostgreSQL advances sequences correctly on INSERT.
-- Existing migration V4 already syncs users_id_seq on deploy.
--
-- Usage:
--   psql -U postgres -d loan_db -f sync_sequences_to_max_id.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION dev_sync_sequence_to_max_id(
    p_table regclass,
    p_column text DEFAULT 'id'
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_seq text;
    v_max bigint;
    v_table_name text := p_table::text;
BEGIN
    v_seq := pg_get_serial_sequence(v_table_name, p_column);

    IF v_seq IS NULL THEN
        RAISE NOTICE 'SKIP: % — no sequence on %', v_table_name, p_column;
        RETURN;
    END IF;

    EXECUTE format('SELECT COALESCE(MAX(%I), 0) FROM %s', p_column, p_table) INTO v_max;

    -- setval(..., max, true): next nextval() returns max + 1
    IF v_max = 0 THEN
        PERFORM setval(v_seq, 1, false);
        RAISE NOTICE 'OK: % — table empty, next id will be 1', v_seq;
    ELSE
        PERFORM setval(v_seq, v_max, true);
        RAISE NOTICE 'OK: % — synced to max(id)=%, next id will be %', v_seq, v_max, v_max + 1;
    END IF;
END;
$$;

SELECT dev_sync_sequence_to_max_id('public.documents'::regclass);
SELECT dev_sync_sequence_to_max_id('public.loan_applications'::regclass);
SELECT dev_sync_sequence_to_max_id('public.notifications'::regclass);
SELECT dev_sync_sequence_to_max_id('public.kyc_details'::regclass);
SELECT dev_sync_sequence_to_max_id('public.credit_scores'::regclass);
SELECT dev_sync_sequence_to_max_id('public.users'::regclass);

DROP FUNCTION dev_sync_sequence_to_max_id(regclass, text);
