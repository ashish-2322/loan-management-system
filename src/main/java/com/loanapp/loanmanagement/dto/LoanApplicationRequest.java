package com.loanapp.loanmanagement.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.loanapp.loanmanagement.enums.LoanType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class LoanApplicationRequest {
    private LoanType loanType;
    @NotNull @Min(1000) private Double loanAmount;
    @NotNull @Min(6) @Max(360)
    @JsonAlias("loanTerm")
    private Integer loanTermMonths;
    private String purpose;
    @NotNull @Min(21) @Max(60) private Integer age;
    private String address;
    private String occupation;
    @NotNull @Min(10000) private Double monthlyIncome;
    private Integer creditScore;

    /** HomeLoan form — not required on DTO; copied to address before validation. */
    private String propertyLocation;
    /** VehicleLoan form — copied to purpose when purpose is empty. */
    private String vehicleType;

    public void prepareForValidation(LoanType pathLoanType) {
        this.loanType = pathLoanType;
        if (isBlank(address) && !isBlank(propertyLocation)) {
            this.address = propertyLocation.trim();
        }
        if (isBlank(purpose) && !isBlank(vehicleType)) {
            this.purpose = vehicleType.trim();
        }
        if (address != null) {
            this.address = address.trim();
        }
        if (occupation != null) {
            this.occupation = occupation.trim();
        }
    }

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
