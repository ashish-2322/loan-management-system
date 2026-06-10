-- KYC details table for customer identity verification
CREATE TABLE IF NOT EXISTS kyc_details (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    aadhaar_document_path VARCHAR(500),
    pan_document_path VARCHAR(500),
    aadhaar_original_name VARCHAR(255),
    pan_original_name VARCHAR(255),
    kyc_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    uploaded_at TIMESTAMP,
    verified_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kyc_details_user_id ON kyc_details(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_details_status ON kyc_details(kyc_status);
