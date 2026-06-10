package com.loanapp.loanmanagement.entity;

import com.loanapp.loanmanagement.enums.DecisionSource;
import com.loanapp.loanmanagement.enums.LoanStatus;
import com.loanapp.loanmanagement.enums.LoanType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "loan_applications")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class LoanApplication {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private User customer;

    @Enumerated(EnumType.STRING)
    private LoanType loanType;

    @Enumerated(EnumType.STRING)
    private LoanStatus status = LoanStatus.PENDING;

    private Double loanAmount;
    private Integer loanTermMonths;
    private String purpose;

    // Customer personal details
    private Integer age;
    private String address;
    private String occupation;
    private Double monthlyIncome;
    private Integer creditScore;

    @Enumerated(EnumType.STRING)
    private DecisionSource decisionSource;

    @Column(length = 500)
    private String approvalReason;

    @Column(length = 500)
    private String rejectionReason;

    private LocalDateTime approvedAt;
    private LocalDateTime rejectedAt;

    // Loan Officer comment
    @Column(length = 1000)
    private String officerComment;

    @ManyToOne
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Builder.Default
    private LocalDateTime appliedAt = LocalDateTime.now();
    private LocalDateTime reviewedAt;
}