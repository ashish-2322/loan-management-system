package com.loanapp.loanmanagement.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String mobileNumber;
    private String otp;
}