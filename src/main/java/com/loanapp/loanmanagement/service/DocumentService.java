package com.loanapp.loanmanagement.service;

import com.loanapp.loanmanagement.entity.*;
import com.loanapp.loanmanagement.enums.LoanType;
import com.loanapp.loanmanagement.repository.*;
import com.loanapp.loanmanagement.util.LoanDocumentTypes;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "jpg", "jpeg", "png");

    private final DocumentRepository documentRepo;
    private final UserRepository userRepository;
    private final LoanApplicationRepository loanRepo;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public void validateLoanDocumentFile(MultipartFile file, String fieldLabel) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException(fieldLabel + " is required.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException(fieldLabel + " must not exceed 10 MB.");
        }
        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            throw new RuntimeException(fieldLabel + " must have a valid file name.");
        }
        String ext = getExtension(originalName);
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new RuntimeException(fieldLabel + " must be PDF, JPG, JPEG, or PNG.");
        }
    }

    public void validateDocumentTypeForLoan(LoanType loanType, String documentType) {
        String expected = LoanDocumentTypes.requiredTypeFor(loanType);
        if (expected == null) {
            throw new RuntimeException("This loan type does not require an application document.");
        }
        if (documentType == null || !expected.equals(documentType.trim())) {
            throw new RuntimeException("Please upload the required " + LoanDocumentTypes.labelFor(loanType) + " document.");
        }
    }

    private String getExtension(String fileName) {
        int dot = fileName.lastIndexOf('.');
        if (dot < 0 || dot == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    public Document uploadDocument(String email, Long loanId,
                                   String documentType, MultipartFile file) throws IOException {
        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        LoanApplication loan = loanRepo.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan not found"));

        if (!loan.getCustomer().getId().equals(customer.getId()))
            throw new RuntimeException("You can only upload documents for your own loan");

        return saveDocumentToLoan(customer, loan, documentType, file);
    }

    public Document uploadDocumentForCustomer(String email, String documentType,
                                              MultipartFile file) throws IOException {
        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Save file to local storage
        Path dirPath = Paths.get(uploadDir, String.valueOf(customer.getId()));
        Files.createDirectories(dirPath);

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = dirPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        Document doc = Document.builder()
                .customer(customer)
                .loanApplication(null)
                .documentType(documentType)
                .fileName(fileName)
                .filePath(filePath.toString())
                .build();
        return documentRepo.save(doc);
    }

    public Document uploadDocumentForLoan(String email, LoanApplication loan,
                                          String documentType, MultipartFile file) throws IOException {
        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!loan.getCustomer().getId().equals(customer.getId()))
            throw new RuntimeException("You can only upload documents for your own loan");
        return saveDocumentToLoan(customer, loan, documentType, file);
    }

    private Document saveDocumentToLoan(User customer, LoanApplication loan,
                                        String documentType, MultipartFile file) throws IOException {
        LoanApplication linkedLoan = loan.getId() == null
                ? loan
                : loanRepo.findById(loan.getId())
                .orElseThrow(() -> new RuntimeException("Loan not found"));
        validateLoanDocumentFile(file, LoanDocumentTypes.labelFor(linkedLoan.getLoanType()));
        validateDocumentTypeForLoan(linkedLoan.getLoanType(), documentType);

        Path dirPath = Paths.get(uploadDir, String.valueOf(customer.getId()));
        Files.createDirectories(dirPath);

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = dirPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        String normalizedType = documentType.trim();
        Document doc = Document.builder()
                .customer(customer)
                .loanApplication(linkedLoan)
                .documentType(normalizedType)
                .fileName(fileName)
                .filePath(filePath.toString())
                .build();
        return documentRepo.save(doc);
    }

    public List<Document> getMyDocuments(String email) {
        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return documentRepo.findByCustomer(customer);
    }

    public List<Document> getUnlinkedDocuments(String email) {
        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return documentRepo.findByCustomerAndLoanApplicationIsNull(customer);
    }

    public void assignUnlinkedDocumentsToLoan(String email, LoanApplication loan) {
        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String requiredType = LoanDocumentTypes.requiredTypeFor(loan.getLoanType());
        if (requiredType == null) {
            return;
        }
        List<Document> unlinked = documentRepo.findByCustomerAndLoanApplicationIsNull(customer);
        List<Document> matching = unlinked.stream()
                .filter(doc -> requiredType.equals(doc.getDocumentType()))
                .toList();
        if (!matching.isEmpty()) {
            for (Document doc : matching) {
                doc.setLoanApplication(loan);
            }
            documentRepo.saveAll(matching);
        }
    }

    public boolean hasDocumentsUploaded(String email) {
        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return !documentRepo.findByCustomerAndLoanApplicationIsNull(customer).isEmpty();
    }

    public List<Document> getDocumentsForLoan(Long loanId) {
        LoanApplication loan = loanRepo.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan not found"));
        return getLoanApplicationDocuments(loan);
    }

    public List<Document> getLoanApplicationDocuments(LoanApplication loan) {
        List<String> applicationTypes = List.of(
                LoanDocumentTypes.SALARY_SLIP,
                LoanDocumentTypes.PROPERTY_DOCUMENT,
                LoanDocumentTypes.VEHICLE_QUOTATION
        );
        if (loan.getId() != null) {
            return documentRepo.findByLoanApplication_IdAndDocumentTypeIn(loan.getId(), applicationTypes);
        }
        return documentRepo.findByLoanApplicationAndDocumentTypeIn(loan, applicationTypes);
    }

    public List<Document> getLoanApplicationDocumentsForCustomer(String email, Long loanId) {
        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        LoanApplication loan = loanRepo.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan not found"));
        if (!loan.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("You can only access documents for your own loan");
        }
        return getLoanApplicationDocuments(loan);
    }

    public Document getDocumentById(Long documentId) {
        return documentRepo.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
    }

    public Resource loadDocumentAsResource(Long documentId) throws IOException {
        Document document = getDocumentById(documentId);
        return loadFileResource(document);
    }

    public Resource loadDocumentAsResourceForCustomer(String email, Long documentId) throws IOException {
        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Document document = getDocumentById(documentId);
        if (!document.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("You can only access your own documents");
        }
        if (!LoanDocumentTypes.isLoanApplicationDocument(document.getDocumentType())) {
            throw new RuntimeException("Document not found");
        }
        return loadFileResource(document);
    }

    public String getDisplayFileName(Document document) {
        if (document.getFileName() == null) {
            return "document";
        }
        int underscore = document.getFileName().indexOf('_');
        if (underscore >= 0 && underscore < document.getFileName().length() - 1) {
            return document.getFileName().substring(underscore + 1);
        }
        return document.getFileName();
    }

    private Resource loadFileResource(Document document) throws IOException {
        Path filePath = Paths.get(document.getFilePath());
        if (!Files.exists(filePath) || !Files.isReadable(filePath)) {
            throw new RuntimeException("Document file not found");
        }
        return new UrlResource(filePath.toUri());
    }
}