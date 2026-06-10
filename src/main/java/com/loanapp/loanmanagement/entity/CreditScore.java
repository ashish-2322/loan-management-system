package com.loanapp.loanmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "credit_scores")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CreditScore {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String mobileNumber;

    @Column(nullable = false)
    private int score;
}