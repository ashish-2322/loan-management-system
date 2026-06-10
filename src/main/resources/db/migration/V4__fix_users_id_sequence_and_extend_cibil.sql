-- Ensure users.id is generated sequentially by PostgreSQL (not application-assigned)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_attribute a
        JOIN pg_class c ON a.attrelid = c.oid
        WHERE c.relname = 'users'
          AND a.attname = 'id'
          AND a.attidentity IN ('a', 'd')
    ) THEN
        CREATE SEQUENCE IF NOT EXISTS users_id_seq;
        ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');
        ALTER SEQUENCE users_id_seq OWNED BY users.id;
    END IF;

    IF pg_get_serial_sequence('users', 'id') IS NOT NULL THEN
        PERFORM setval(
            pg_get_serial_sequence('users', 'id'),
            COALESCE((SELECT MAX(id) FROM users), 0) + 1,
            false
        );
    ELSIF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'users_id_seq') THEN
        PERFORM setval(
            'users_id_seq',
            COALESCE((SELECT MAX(id) FROM users), 0) + 1,
            false
        );
    END IF;
END $$;

-- Extend cibil_score rows so customer IDs beyond 100 can resolve a score
INSERT INTO cibil_score (id, credit_score)
SELECT
    gs.id,
    CASE gs.id
        WHEN 10 THEN 600
        WHEN 20 THEN 800
        WHEN 30 THEN 700
        ELSE 550 + ((gs.id * 43) % 451)
    END
FROM generate_series(101, 1000) AS gs(id)
ON CONFLICT (id) DO NOTHING;
