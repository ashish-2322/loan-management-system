package com.loanapp.loanmanagement.dto;

import com.loanapp.loanmanagement.enums.KycStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfficerCustomerKycResponse {
    private Long userId;
    private String fullName;
    private String email;
    private String mobileNumber;
    private String address;
    private Double monthlyIncome;
    private Integer creditScore;
    private KycStatus kycStatus;
    private String aadhaarFile;
    private String panFile;
}
