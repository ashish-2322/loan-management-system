package com.loanapp.loanmanagement.service;
import com.loanapp.loanmanagement.dto.*;

import com.loanapp.loanmanagement.entity.*;

import com.loanapp.loanmanagement.enums.DecisionSource;
import com.loanapp.loanmanagement.enums.LoanStatus;
import com.loanapp.loanmanagement.util.LoanDocumentTypes;

import com.loanapp.loanmanagement.repository.*;

import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import java.time.LocalDateTime;

import java.util.List;

@Service

@RequiredArgsConstructor

@Slf4j

public class LoanService {

    private static final String AUTO_APPROVAL_REASON =

            "Automatically approved due to excellent credit score.";

    private static final String AUTO_REJECTION_REASON =

            "Automatically rejected due to low credit score.";

    private static final String AUTO_APPROVAL_NOTIFICATION =

            "Congratulations! Your loan application has been automatically approved.";

    private static final String AUTO_REJECTION_NOTIFICATION =

            "Your loan application was automatically rejected due to credit eligibility criteria.";



    private final LoanApplicationRepository loanRepo;

    private final UserRepository userRepository;

    private final NotificationService notificationService;

    private final DocumentService documentService;

    private final KycService kycService;



    public LoanApplication applyForLoan(String email, LoanApplicationRequest request) {

        User customer = userRepository.findByEmail(email)

                .orElseThrow(() -> new RuntimeException("User not found"));



        validateLoanRequest(email, request);

        if (LoanDocumentTypes.requiresDocument(request.getLoanType())) {
            throw new RuntimeException(
                    "Please upload " + LoanDocumentTypes.labelFor(request.getLoanType()) + " before applying for a loan.");
        }



        LoanApplication loan = buildLoanApplication(customer, request);

        loanRepo.save(loan);

        documentService.assignUnlinkedDocumentsToLoan(email, loan);

        notificationService.createNotification(customer, resolveSubmissionNotification(loan));



        return loan;

    }



    @Transactional
    public LoanApplication applyForLoanWithDocument(String email, LoanApplicationRequest request,

                                                    String documentType, MultipartFile file) throws IOException {

        if (documentType == null || documentType.trim().isEmpty() || file == null || file.isEmpty()) {

            throw new RuntimeException("Please upload required documents before applying for a loan.");

        }



        User customer = userRepository.findByEmail(email)

                .orElseThrow(() -> new RuntimeException("User not found"));



        validateLoanRequest(email, request);

        documentService.validateDocumentTypeForLoan(request.getLoanType(), documentType);
        documentService.validateLoanDocumentFile(file, LoanDocumentTypes.labelFor(request.getLoanType()));



        LoanApplication loan = buildLoanApplication(customer, request);
        loan.setLoanType(request.getLoanType());

        loan = loanRepo.save(loan);

        documentService.uploadDocumentForLoan(email, loan, documentType.trim(), file);

        documentService.assignUnlinkedDocumentsToLoan(email, loan);

        notificationService.createNotification(customer, resolveSubmissionNotification(loan));



        return loan;

    }



    public CustomerProfileResponse getCustomerProfile(String email) {

        User customer = userRepository.findByEmail(email)

                .orElseThrow(() -> new RuntimeException("User not found"));



        return CustomerProfileResponse.builder()

                .id(customer.getId())

                .fullName(customer.getFullName())

                .email(customer.getEmail())

                .mobileNumber(customer.getMobileNumber())

                .creditScore(customer.getCreditScore())

                .build();

    }



    private void validateLoanRequest(String email, LoanApplicationRequest request) {

        if (request.getAge() < 21 || request.getAge() > 60)

            throw new RuntimeException("Age must be between 21 and 60");

        if(request.getMonthlyIncome() < 10000)
            throw new RuntimeException("Monthly income must be 10000 or more to apply for a loan");

        if (!kycService.isKycCompleted(email))

            throw new RuntimeException("Please complete KYC before applying for a loan.");

    }



    private int resolveCustomerCreditScore(User customer) {

        if (customer.getCreditScore() == null)

            throw new RuntimeException("Credit score not assigned to customer. Please contact support.");

        return customer.getCreditScore();

    }



    private LoanApplication buildLoanApplication(User customer, LoanApplicationRequest request) {

        int creditScore = resolveCustomerCreditScore(customer);

        LocalDateTime now = LocalDateTime.now();

        LoanStatus status;

        DecisionSource decisionSource;

        String approvalReason = null;

        String rejectionReason = null;

        LocalDateTime approvedAt = null;

        LocalDateTime rejectedAt = null;



        if (creditScore >= 750) {

            status = LoanStatus.APPROVED;

            decisionSource = DecisionSource.AUTO_SYSTEM;

            approvalReason = AUTO_APPROVAL_REASON;

            approvedAt = now;

        } else if (creditScore < 650) {

            status = LoanStatus.REJECTED;

            decisionSource = DecisionSource.AUTO_SYSTEM;

            rejectionReason = AUTO_REJECTION_REASON;

            rejectedAt = now;

        } else {

            status = LoanStatus.PENDING;

            decisionSource = DecisionSource.LOAN_OFFICER;

        }



        return LoanApplication.builder()

                .customer(customer)

                .loanType(request.getLoanType())

                .loanAmount(request.getLoanAmount())

                .loanTermMonths(request.getLoanTermMonths())

                .purpose(request.getPurpose())

                .age(request.getAge())

                .address(request.getAddress())

                .occupation(request.getOccupation())

                .monthlyIncome(request.getMonthlyIncome())

                .creditScore(creditScore)

                .status(status)

                .decisionSource(decisionSource)

                .approvalReason(approvalReason)

                .rejectionReason(rejectionReason)

                .approvedAt(approvedAt)

                .rejectedAt(rejectedAt)

                .appliedAt(now)

                .build();

    }



    private String resolveSubmissionNotification(LoanApplication loan) {

        if (loan.getStatus() == LoanStatus.APPROVED) {

            return AUTO_APPROVAL_NOTIFICATION;

        }

        if (loan.getStatus() == LoanStatus.REJECTED) {

            return AUTO_REJECTION_NOTIFICATION;

        }

        return "Your loan application has been submitted and is pending review by a loan officer.";

    }



    public List<LoanApplication> getCustomerLoans(String email) {

        User customer = userRepository.findByEmail(email)

                .orElseThrow(() -> new RuntimeException("User not found"));

        return loanRepo.findByCustomerOrderByAppliedAtDesc(customer);

    }



    public LoanApplication reviewLoan(Long loanId, String officerEmail, OfficerReviewRequest request) {

        log.info("Review loan id={}, officer={}, status={}, comment={}",

                loanId, officerEmail, request.getStatus(), request.getComment());

        LoanApplication loan = loanRepo.findById(loanId)

                .orElseThrow(() -> new RuntimeException("Loan not found"));

        User officer = userRepository.findByEmail(officerEmail)

                .orElseThrow(() -> new RuntimeException("Officer not found"));



        LoanStatus newStatus = request.resolveStatus();

        LocalDateTime now = LocalDateTime.now();



        loan.setStatus(newStatus);

        loan.setOfficerComment(request.getComment());

        loan.setReviewedBy(officer);

        loan.setReviewedAt(now);



        if (newStatus == LoanStatus.APPROVED) {

            loan.setApprovedAt(now);

        } else if (newStatus == LoanStatus.REJECTED) {

            loan.setRejectedAt(now);

        }



        loanRepo.save(loan);



        String msg = "Your loan application #" + loanId + " has been " +

                newStatus.name().toLowerCase().replace("_", " ") +

                ". Officer comment: " + request.getComment();

        notificationService.createNotification(loan.getCustomer(), msg);



        return loan;

    }



    public List<LoanApplication> getAllPendingLoans() {

        return loanRepo.findPendingForOfficerReview();

    }



    public List<LoanApplication> getLoansByStatus(LoanStatus status) {
        return loanRepo.findByStatusWithCustomerOrderByAppliedAtDesc(status);
    }

    public java.util.Map<String, Long> getLoanCountsForOfficer() {
        java.util.Map<String, Long> counts = new java.util.LinkedHashMap<>();
        counts.put("PENDING", loanRepo.countByStatus(LoanStatus.PENDING));
        counts.put("APPROVED", loanRepo.countByStatus(LoanStatus.APPROVED));
        counts.put("REJECTED", loanRepo.countByStatus(LoanStatus.REJECTED));
        return counts;
    }



    public List<LoanApplication> getAllLoans() {

        return loanRepo.findAll();

    }

    public List<LoanApplication> getAllLoansForOfficer() {
        return loanRepo.findAllWithCustomerOrderByAppliedAtDesc();
    }

}


