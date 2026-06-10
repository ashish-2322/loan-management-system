package com.loanapp.loanmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity
@Table(name = "documents")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Document {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private User customer;

    @ManyToOne
    @JoinColumn(name = "loan_application_id")
    private LoanApplication loanApplication;

    private String documentType; // AADHAAR, PAN, SALARY_SLIP, etc.
    private String fileName;
    private String filePath;

    @Builder.Default
    private LocalDateTime uploadedAt = LocalDateTime.now();
}