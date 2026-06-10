package com.loanapp.loanmanagement.controller;

import com.loanapp.loanmanagement.dto.*;
import com.loanapp.loanmanagement.entity.Document;
import com.loanapp.loanmanagement.enums.LoanType;
import com.loanapp.loanmanagement.service.*;
import com.loanapp.loanmanagement.util.FileResponseUtil;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
@Slf4j
public class CustomerController {
    private final LoanService loanService;
    private final DocumentService documentService;
    private final NotificationService notificationService;
    private final Validator validator;

    // Apply for loan — loanType in path determines which loan form
    @PostMapping(value = "/apply/{loanType}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> applyLoan(@PathVariable String loanType,
                                       @RequestBody LoanApplicationRequest request,
                                       Authentication auth) {
        request.prepareForValidation(LoanType.valueOf(loanType));

        var violations = validator.validate(request);
        if (!violations.isEmpty()) {
            String details = violations.stream()
                    .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                    .collect(Collectors.joining(", "));
            log.error("Bean validation failed for applyLoan: {}", details);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(com.loanapp.loanmanagement.util.ResponseUtil.error(details));
        }

        log.info("Incoming request = {}", request);
        return ResponseEntity.ok(loanService.applyForLoan(auth.getName(), request));
    }

    @PostMapping(value = "/apply/{loanType}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> applyLoanWithDocument(@PathVariable String loanType,
                                                   @ModelAttribute LoanApplicationRequest request,
                                                   @RequestParam String documentType,
                                                   @RequestParam MultipartFile file,
                                                   Authentication auth) {
        request.prepareForValidation(LoanType.valueOf(loanType));

        var violations = validator.validate(request);
        if (!violations.isEmpty()) {
            String details = violations.stream()
                    .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                    .collect(Collectors.joining(", "));
            log.error("Bean validation failed for applyLoanWithDocument: {}", details);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(com.loanapp.loanmanagement.util.ResponseUtil.error(details));
        }

        if (documentType == null || documentType.trim().isEmpty() || file == null || file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(com.loanapp.loanmanagement.util.ResponseUtil.error("Please upload required documents before applying for a loan."));
        }

        try {
            log.info("Incoming file upload loan request = {}", request);
            return ResponseEntity.ok(loanService.applyForLoanWithDocument(auth.getName(), request, documentType, file));
        } catch (Exception ex) {
            log.error("Error applying loan with document", ex);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(com.loanapp.loanmanagement.util.ResponseUtil.error(ex.getMessage()));
        }
    }

    @GetMapping("/my-loans")
    public ResponseEntity<?> myLoans(Authentication auth) {
        return ResponseEntity.ok(loanService.getCustomerLoans(auth.getName()));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> profile(Authentication auth) {
        return ResponseEntity.ok(loanService.getCustomerProfile(auth.getName()));
    }

    @PostMapping("/upload-document")
    public ResponseEntity<?> uploadDoc(@RequestParam Long loanId,
                                       @RequestParam String documentType,
                                       @RequestParam MultipartFile file,
                                       Authentication auth) throws Exception {
        return ResponseEntity.ok(
                documentService.uploadDocument(auth.getName(), loanId, documentType, file));
    }

    @PostMapping("/upload-document-pre-application")
    public ResponseEntity<?> uploadDocumentPreApplication(@RequestParam String documentType,
                                                         @RequestParam MultipartFile file,
                                                         Authentication auth) throws Exception {
        return ResponseEntity.ok(
                documentService.uploadDocumentForCustomer(auth.getName(), documentType, file));
    }

    @GetMapping("/my-documents")
    public ResponseEntity<?> myDocuments(Authentication auth) {
        return ResponseEntity.ok(documentService.getMyDocuments(auth.getName()));
    }

    @GetMapping("/loan-documents/{loanId}")
    public ResponseEntity<?> getLoanDocuments(@PathVariable Long loanId, Authentication auth) {
        return ResponseEntity.ok(documentService.getLoanApplicationDocumentsForCustomer(auth.getName(), loanId));
    }

    @GetMapping("/loan-documents/download/{documentId}")
    public ResponseEntity<Resource> downloadLoanDocument(@PathVariable Long documentId,
                                                         @RequestParam(defaultValue = "false") boolean inline,
                                                         Authentication auth) throws Exception {
        Document document = documentService.getDocumentById(documentId);
        Resource resource = documentService.loadDocumentAsResourceForCustomer(auth.getName(), documentId);
        String fileName = documentService.getDisplayFileName(document);
        return FileResponseUtil.build(resource, fileName, inline);
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> notifications(Authentication auth) {
        return ResponseEntity.ok(notificationService.getUserNotifications(auth.getName()));
    }

    @PutMapping("/notifications/read")
    public ResponseEntity<?> markRead(Authentication auth) {
        notificationService.markAllRead(auth.getName());
        return ResponseEntity.ok("All notifications marked as read");
    }
}