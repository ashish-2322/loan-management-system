package com.loanapp.loanmanagement.repository;

import com.loanapp.loanmanagement.entity.CreditScore;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CreditScoreRepository extends JpaRepository<CreditScore, Long> {
    Optional<CreditScore> findByMobileNumber(String mobileNumber);
}