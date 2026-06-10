-- =============================================================================
-- DEV / TEST ONLY — Reset PostgreSQL sequences when tables are empty
-- =============================================================================
--
-- Why IDs do not restart after DELETE:
--   PostgreSQL sequences (SERIAL, BIGSERIAL, IDENTITY) keep their last value.
--   Deleting rows does NOT rewind the sequence. Next INSERT gets MAX(used)+1.
--   This is expected, production-safe behavior.
--
-- This script does NOT delete data. Run only after you have already removed
-- all rows (in FK-safe order) if you want the next ID to start at 1.
--
-- Suggested manual clear order (development only):
--   1. documents
--   2. loan_applications
--   3. notifications
--   4. kyc_details
--   5. credit_scores
--   6. users
--   (cibil_score is a separate lookup table; see note below)
--
-- Usage (psql):
--   psql -U postgres -d loan_db -f reset_sequences_when_tables_empty.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION dev_reset_sequence_if_table_empty(
    p_table regclass,
    p_column text DEFAULT 'id'
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_seq text;
    v_count bigint;
    v_table_name text := p_table::text;
BEGIN
    EXECUTE format('SELECT COUNT(*) FROM %s', p_table) INTO v_count;

    IF v_count > 0 THEN
        RAISE NOTICE 'SKIP: % has % row(s) — sequence not changed', v_table_name, v_count;
        RETURN;
    END IF;

    v_seq := pg_get_serial_sequence(v_table_name, p_column);

    IF v_seq IS NULL THEN
        RAISE NOTICE 'SKIP: % has no serial/identity sequence on column %', v_table_name, p_column;
        RETURN;
    END IF;

    PERFORM setval(v_seq, 1, false);
    RAISE NOTICE 'OK: % reset — next % will be 1', v_seq, p_column;
END;
$$;

-- Auto-increment tables (JPA GenerationType.IDENTITY → PostgreSQL IDENTITY/BIGSERIAL)
SELECT dev_reset_sequence_if_table_empty('public.documents'::regclass);
SELECT dev_reset_sequence_if_table_empty('public.loan_applications'::regclass);
SELECT dev_reset_sequence_if_table_empty('public.notifications'::regclass);
SELECT dev_reset_sequence_if_table_empty('public.kyc_details'::regclass);
SELECT dev_reset_sequence_if_table_empty('public.credit_scores'::regclass);
SELECT dev_reset_sequence_if_table_empty('public.users'::regclass);

-- cibil_score.id is NOT auto-generated (seeded lookup by customer id in application code).
-- If you empty cibil_score for testing, you may re-seed from V3/V4 migrations separately.

DROP FUNCTION dev_reset_sequence_if_table_empty(regclass, text);

-- Verify current sequence values (optional):
-- SELECT sequencename, last_value FROM pg_sequences WHERE schemaname = 'public' ORDER BY 1;
