package com.loanapp.loanmanagement.repository;

import com.loanapp.loanmanagement.entity.LoanApplication;
import com.loanapp.loanmanagement.entity.User;
import com.loanapp.loanmanagement.enums.DecisionSource;
import com.loanapp.loanmanagement.enums.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface LoanApplicationRepository extends JpaRepository<LoanApplication, Long> {
    List<LoanApplication> findByCustomer(User customer);
    List<LoanApplication> findByStatus(LoanStatus status);

    @Query("SELECT l FROM LoanApplication l JOIN FETCH l.customer WHERE l.status = :status")
    List<LoanApplication> findByStatusWithCustomer(@Param("status") LoanStatus status);

    @Query("SELECT l FROM LoanApplication l JOIN FETCH l.customer WHERE l.status = :status ORDER BY l.appliedAt DESC")
    List<LoanApplication> findByStatusWithCustomerOrderByAppliedAtDesc(@Param("status") LoanStatus status);

    long countByStatus(LoanStatus status);

    @Query("SELECT l FROM LoanApplication l JOIN FETCH l.customer " +
           "WHERE l.status = 'PENDING' AND l.decisionSource = 'LOAN_OFFICER' " +
           "AND l.creditScore >= 650 AND l.creditScore <= 749")
    List<LoanApplication> findPendingForOfficerReview();

    @Query("SELECT l FROM LoanApplication l JOIN FETCH l.customer " +
           "WHERE l.status = :status AND l.decisionSource = 'LOAN_OFFICER'")
    List<LoanApplication> findOfficerReviewedByStatus(@Param("status") LoanStatus status);

    List<LoanApplication> findByCustomerOrderByAppliedAtDesc(User customer);

    @Query("SELECT l FROM LoanApplication l JOIN FETCH l.customer ORDER BY l.appliedAt DESC")
    List<LoanApplication> findAllWithCustomerOrderByAppliedAtDesc();
}