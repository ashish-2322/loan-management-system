package com.loanapp.loanmanagement.controller;

import com.loanapp.loanmanagement.dto.OfficerReviewRequest;
import com.loanapp.loanmanagement.enums.Role;
import com.loanapp.loanmanagement.enums.LoanStatus;
import com.loanapp.loanmanagement.service.DocumentService;
import com.loanapp.loanmanagement.service.KycService;
import com.loanapp.loanmanagement.service.LoanService;
import com.loanapp.loanmanagement.util.FileResponseUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/officer")
@RequiredArgsConstructor
@Slf4j
public class LoanOfficerController {
    private final LoanService loanService;
    private final DocumentService documentService;
    private final KycService kycService;

    @GetMapping("/pending-loans")
    public ResponseEntity<?> pendingLoans() {
        return ResponseEntity.ok(loanService.getAllPendingLoans());
    }

    @GetMapping("/loans")
    public ResponseEntity<?> loansByStatus(@RequestParam(defaultValue = "PENDING") String status) {
        return ResponseEntity.ok(loanService.getLoansByStatus(LoanStatus.valueOf(status.toUpperCase())));
    }

    @GetMapping("/loan-counts")
    public ResponseEntity<?> loanCounts() {
        return ResponseEntity.ok(loanService.getLoanCountsForOfficer());
    }

    @GetMapping("/all-loans")
    public ResponseEntity<?> allLoans() {
        return ResponseEntity.ok(loanService.getAllLoansForOfficer());
    }

    @PutMapping("/review/{loanId}")
    public ResponseEntity<?> reviewLoan(@PathVariable Long loanId,
                                        @RequestBody OfficerReviewRequest request,
                                        Authentication auth) {
        log.info("Received Loan ID: {}", loanId);
        log.info("Received Review Request: status={}, comment={}", request.getStatus(), request.getComment());
        return ResponseEntity.ok(loanService.reviewLoan(loanId, auth.getName(), request));
    }

    @GetMapping("/loan-documents/{loanId}")
    public ResponseEntity<?> getLoanDocuments(@PathVariable Long loanId) {
        return ResponseEntity.ok(documentService.getDocumentsForLoan(loanId));
    }

    @GetMapping("/loan-documents/download/{documentId}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long documentId,
                                                     @RequestParam(defaultValue = "false") boolean inline) throws Exception {
        com.loanapp.loanmanagement.entity.Document document = documentService.getDocumentById(documentId);
        Resource resource = documentService.loadDocumentAsResource(documentId);
        String fileName = documentService.getDisplayFileName(document);
        return FileResponseUtil.build(resource, fileName, inline);
    }

    @GetMapping("/customer/{userId}/kyc")
    public ResponseEntity<?> getCustomerKyc(@PathVariable Long userId) {
        return ResponseEntity.ok(kycService.getCustomerKycForOfficer(userId));
    }

    @GetMapping("/customer/{userId}/kyc/aadhaar")
    public ResponseEntity<Resource> downloadCustomerAadhaar(@PathVariable Long userId,
                                                          @RequestParam(defaultValue = "false") boolean inline,
                                                          org.springframework.security.core.Authentication auth) throws Exception {
        Resource resource = kycService.loadAadhaarForUser(auth.getName(), Role.LOAN_OFFICER, userId);
        String fileName = kycService.getAadhaarOriginalName(auth.getName(), Role.LOAN_OFFICER, userId);
        return FileResponseUtil.build(resource, fileName, inline);
    }

    @GetMapping("/customer/{userId}/kyc/pan")
    public ResponseEntity<Resource> downloadCustomerPan(@PathVariable Long userId,
                                                        @RequestParam(defaultValue = "false") boolean inline,
                                                        org.springframework.security.core.Authentication auth) throws Exception {
        Resource resource = kycService.loadPanForUser(auth.getName(), Role.LOAN_OFFICER, userId);
        String fileName = kycService.getPanOriginalName(auth.getName(), Role.LOAN_OFFICER, userId);
        return FileResponseUtil.build(resource, fileName, inline);
    }
}