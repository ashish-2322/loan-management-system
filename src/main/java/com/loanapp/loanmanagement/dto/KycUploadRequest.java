package com.loanapp.loanmanagement.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

/**
 * Multipart upload payload for POST /api/kyc/upload.
 * Bound via {@code aadhaarFile} and {@code panFile} request parameters in {@link com.loanapp.loanmanagement.controller.KycController}.
 */
@Data
public class KycUploadRequest {
    private MultipartFile aadhaarFile;
    private MultipartFile panFile;
}
