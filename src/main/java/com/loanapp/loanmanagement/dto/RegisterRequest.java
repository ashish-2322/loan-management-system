package com.loanapp.loanmanagement.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank private String fullName;
    @Email @NotBlank private String email;
    @NotBlank @Size(min = 6) private String password;
    @NotBlank @Pattern(regexp = "^[6-9]\\d{9}$") private String mobileNumber;

    private String role;
}