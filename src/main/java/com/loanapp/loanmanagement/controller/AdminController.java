package com.loanapp.loanmanagement.controller;

import com.loanapp.loanmanagement.entity.*;
import com.loanapp.loanmanagement.enums.LoanStatus;
import com.loanapp.loanmanagement.repository.*;
import com.loanapp.loanmanagement.service.LoanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {
    private final UserRepository userRepository;
    private final LoanService loanService;
    private final LoanApplicationRepository loanRepo;
    private final NotificationRepository notificationRepository;
    private final DocumentRepository documentRepository;
    private final CreditScoreRepository creditScoreRepository;
    private final KycRepository kycRepository;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, Authentication auth) {
        log.info("Admin delete user request: targetId={}", id);

        User currentAdmin = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Access denied"));

        if (id.equals(currentAdmin.getId())) {
            throw new RuntimeException("Cannot delete currently logged-in admin.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        documentRepository.deleteAll(documentRepository.findByCustomer(user));

        for (LoanApplication loan : loanRepo.findByCustomer(user)) {
            documentRepository.deleteAll(documentRepository.findByLoanApplication(loan));
            loanRepo.delete(loan);
        }

        notificationRepository.deleteAll(notificationRepository.findByUserOrderByCreatedAtDesc(user));

        kycRepository.findByUserId(id).ifPresent(kycRepository::delete);

        if (user.getMobileNumber() != null) {
            creditScoreRepository.findByMobileNumber(user.getMobileNumber())
                    .ifPresent(creditScoreRepository::delete);
        }

        for (LoanApplication loan : loanRepo.findAll()) {
            if (loan.getReviewedBy() != null && id.equals(loan.getReviewedBy().getId())) {
                loan.setReviewedBy(null);
                loanRepo.save(loan);
            }
        }

        userRepository.delete(user);
        log.info("User deleted successfully: id={}", id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @GetMapping("/all-loans")
    public ResponseEntity<?> allLoans() {
        return ResponseEntity.ok(loanService.getAllLoans());
    }

    @GetMapping("/report")
    public ResponseEntity<?> report() {
        long pending = loanRepo.countByStatus(LoanStatus.PENDING);
        long approved = loanRepo.countByStatus(LoanStatus.APPROVED);
        long rejected = loanRepo.countByStatus(LoanStatus.REJECTED);
        Map<String, Long> report = new LinkedHashMap<>();
        report.put("totalLoans", loanRepo.count());
        report.put("approved", approved);
        report.put("rejected", rejected);
        report.put("pending", pending);
        return ResponseEntity.ok(report);
    }
}
