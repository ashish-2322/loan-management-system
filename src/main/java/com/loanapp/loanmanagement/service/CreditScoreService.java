package com.loanapp.loanmanagement.service;

import com.loanapp.loanmanagement.enums.LoanStatus;
import com.loanapp.loanmanagement.repository.CreditScoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreditScoreService {
    private final CreditScoreRepository creditScoreRepository;

    public int getScoreFromDatabase(String mobileNumber) {
        return creditScoreRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new RuntimeException("Credit score not found for this mobile number"))
                .getScore();
    }

    public LoanStatus evaluateScore(int score) {
        if (score >= 750)     return LoanStatus.APPROVED;
        if (score < 650)      return LoanStatus.REJECTED;
        return LoanStatus.PENDING;
    }
}