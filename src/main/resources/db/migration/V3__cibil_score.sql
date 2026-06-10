-- CIBIL score simulation table (separate from credit_scores)
CREATE TABLE IF NOT EXISTS cibil_score (
    id BIGINT PRIMARY KEY,
    credit_score INTEGER NOT NULL
);

-- Customer credit score column (assigned at registration)
ALTER TABLE users ADD COLUMN IF NOT EXISTS credit_score INTEGER;

-- Seed 100 CIBIL records (scores between 550 and 1000)
-- Test cases: ID 10 = 600 (auto reject), ID 20 = 800 (auto approve), ID 30 = 700 (pending)
INSERT INTO cibil_score (id, credit_score)
SELECT
    gs.id,
    CASE gs.id
        WHEN 10 THEN 600
        WHEN 20 THEN 800
        WHEN 30 THEN 700
        ELSE 550 + ((gs.id * 43) % 451)
    END
FROM generate_series(1, 100) AS gs(id)
ON CONFLICT (id) DO NOTHING;
