package com.loanapp.loanmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cibil_score")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CibilScore {
    @Id
    private Long id;

    @Column(name = "credit_score", nullable = false)
    private Integer creditScore;
}
