package com.loanapp.loanmanagement.dto;

import com.loanapp.loanmanagement.enums.LoanStatus;
import lombok.Data;

@Data
public class OfficerReviewRequest {
    /** Frontend sends APPROVE / REJECT; backend enum is APPROVED / REJECTED. */
    private String status;
    private String comment;

    public LoanStatus resolveStatus() {
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }
        return switch (status.trim().toUpperCase()) {
            case "APPROVE", "APPROVED" -> LoanStatus.APPROVED;
            case "REJECT", "REJECTED" -> LoanStatus.REJECTED;
            default -> LoanStatus.valueOf(status.trim().toUpperCase());
        };
    }
}