-- Automatic Loan Decision - Test Data Examples
-- Credit scores are stored in credit_scores table (keyed by mobile_number).

-- Customer A: Credit Score = 800 → Expected: Auto Approved
INSERT INTO credit_scores (mobile_number, score)
VALUES ('9000000001', 800)
ON CONFLICT (mobile_number) DO UPDATE SET score = 800;

-- Customer B: Credit Score = 600 → Expected: Auto Rejected
INSERT INTO credit_scores (mobile_number, score)
VALUES ('9000000002', 600)
ON CONFLICT (mobile_number) DO UPDATE SET score = 600;

-- Customer C: Credit Score = 700 → Expected: Sent To Loan Officer
INSERT INTO credit_scores (mobile_number, score)
VALUES ('9000000003', 700)
ON CONFLICT (mobile_number) DO UPDATE SET score = 700;

-- Verify after loan submission:
-- Customer A: status='APPROVED', decision_source='AUTO_SYSTEM'
-- Customer B: status='REJECTED', decision_source='AUTO_SYSTEM'
-- Customer C: status='PENDING', decision_source='LOAN_OFFICER'
