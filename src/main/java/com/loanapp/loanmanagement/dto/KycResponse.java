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
public class KycResponse {
    private KycStatus status;
    private String aadhaarFile;
    private String panFile;
}
