-- Schema reference for automatic loan decision fields on loan_applications.
-- Hibernate ddl-auto=update will create these columns automatically.
-- Use this script only if you need manual migration.

ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS decision_source VARCHAR(255);
ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS approval_reason VARCHAR(500);
ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(500);
ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;
