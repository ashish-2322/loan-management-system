package com.loanapp.loanmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CustomerProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private String mobileNumber;
    private Integer creditScore;
}
