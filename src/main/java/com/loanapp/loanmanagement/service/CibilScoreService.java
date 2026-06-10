package com.loanapp.loanmanagement.service;

import com.loanapp.loanmanagement.repository.CibilScoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CibilScoreService {
    private final CibilScoreRepository cibilScoreRepository;

    public int getScoreByCustomerId(Long customerId) {
        return cibilScoreRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException(
                        "CIBIL score not found for customer ID: " + customerId))
                .getCreditScore();
    }
}
