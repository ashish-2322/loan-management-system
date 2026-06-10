package com.loanapp.loanmanagement.repository;

import com.loanapp.loanmanagement.entity.Document;
import com.loanapp.loanmanagement.entity.LoanApplication;
import com.loanapp.loanmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByCustomer(User customer);
    List<Document> findByCustomerAndLoanApplicationIsNull(User customer);
    List<Document> findByLoanApplication(LoanApplication loanApplication);
    List<Document> findByLoanApplicationAndDocumentTypeIn(LoanApplication loanApplication, Collection<String> documentTypes);
    List<Document> findByLoanApplication_IdAndDocumentTypeIn(Long loanApplicationId, Collection<String> documentTypes);
    Optional<Document> findByLoanApplicationAndDocumentType(LoanApplication loanApplication, String documentType);
}