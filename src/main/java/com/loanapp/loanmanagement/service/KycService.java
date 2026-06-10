package com.loanapp.loanmanagement.service;

import com.loanapp.loanmanagement.dto.KycResponse;
import com.loanapp.loanmanagement.dto.KycUploadResponse;
import com.loanapp.loanmanagement.dto.OfficerCustomerKycResponse;
import com.loanapp.loanmanagement.entity.KycDetails;
import com.loanapp.loanmanagement.entity.LoanApplication;
import com.loanapp.loanmanagement.entity.User;
import com.loanapp.loanmanagement.enums.KycStatus;
import com.loanapp.loanmanagement.enums.Role;
import com.loanapp.loanmanagement.repository.KycRepository;
import com.loanapp.loanmanagement.repository.LoanApplicationRepository;
import com.loanapp.loanmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class KycService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "jpg", "jpeg", "png");

    private final KycRepository kycRepository;
    private final UserRepository userRepository;
    private final LoanApplicationRepository loanApplicationRepository;
    private final NotificationService notificationService;

    @Value("${file.kyc-upload-dir:uploads/kyc}")
    private String kycUploadDir;

    public KycUploadResponse uploadKyc(String email, MultipartFile aadhaarFile, MultipartFile panFile) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        KycDetails existing = kycRepository.findByUser(user).orElse(null);
        if (existing != null && existing.getKycStatus() == KycStatus.COMPLETED) {
            throw new RuntimeException("KYC is already completed and cannot be modified.");
        }

        validateFile(aadhaarFile, "Aadhaar");
        validateFile(panFile, "PAN");

        Path userDir = Paths.get(kycUploadDir, String.valueOf(user.getId()));
        Files.createDirectories(userDir);

        String aadhaarExt = getExtension(aadhaarFile.getOriginalFilename());
        String panExt = getExtension(panFile.getOriginalFilename());

        Path aadhaarPath = userDir.resolve("aadhaar." + aadhaarExt);
        Path panPath = userDir.resolve("pan." + panExt);

        Files.copy(aadhaarFile.getInputStream(), aadhaarPath, StandardCopyOption.REPLACE_EXISTING);
        Files.copy(panFile.getInputStream(), panPath, StandardCopyOption.REPLACE_EXISTING);

        LocalDateTime now = LocalDateTime.now();
        KycDetails kyc = existing != null ? existing : KycDetails.builder().user(user).build();
        kyc.setAadhaarDocumentPath(aadhaarPath.toString());
        kyc.setPanDocumentPath(panPath.toString());
        kyc.setAadhaarOriginalName(aadhaarFile.getOriginalFilename());
        kyc.setPanOriginalName(panFile.getOriginalFilename());
        kyc.setKycStatus(KycStatus.COMPLETED);
        kyc.setUploadedAt(now);
        kyc.setVerifiedAt(now);
        kyc.setUpdatedAt(now);
        if (kyc.getCreatedAt() == null) {
            kyc.setCreatedAt(now);
        }

        kycRepository.save(kyc);

        notificationService.createNotification(user,
                "Your KYC has been completed successfully. You can now apply for loans.");

        return KycUploadResponse.builder()
                .message("KYC completed successfully")
                .status(KycStatus.COMPLETED)
                .build();
    }

    public KycResponse getMyKyc(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return kycRepository.findByUser(user)
                .map(this::toKycResponse)
                .orElse(KycResponse.builder()
                        .status(KycStatus.PENDING)
                        .build());
    }

    public boolean isKycCompleted(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return kycRepository.findByUser(user)
                .map(k -> k.getKycStatus() == KycStatus.COMPLETED)
                .orElse(false);
    }

    public Resource loadAadhaarForUser(String requesterEmail, Role requesterRole, Long targetUserId) throws IOException {
        KycDetails kyc = getKycForAccess(requesterEmail, requesterRole, targetUserId);
        return loadResource(kyc.getAadhaarDocumentPath(), kyc.getAadhaarOriginalName());
    }

    public Resource loadPanForUser(String requesterEmail, Role requesterRole, Long targetUserId) throws IOException {
        KycDetails kyc = getKycForAccess(requesterEmail, requesterRole, targetUserId);
        return loadResource(kyc.getPanDocumentPath(), kyc.getPanOriginalName());
    }

    public String getAadhaarOriginalName(String requesterEmail, Role requesterRole, Long targetUserId) {
        KycDetails kyc = getKycForAccess(requesterEmail, requesterRole, targetUserId);
        return kyc.getAadhaarOriginalName();
    }

    public String getPanOriginalName(String requesterEmail, Role requesterRole, Long targetUserId) {
        KycDetails kyc = getKycForAccess(requesterEmail, requesterRole, targetUserId);
        return kyc.getPanOriginalName();
    }

    public OfficerCustomerKycResponse getCustomerKycForOfficer(Long userId) {
        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        KycDetails kyc = kycRepository.findByUser(customer).orElse(null);
        LoanApplication latestLoan = resolveLatestLoan(customer);

        return OfficerCustomerKycResponse.builder()
                .userId(customer.getId())
                .fullName(customer.getFullName())
                .email(customer.getEmail())
                .mobileNumber(customer.getMobileNumber())
                .address(latestLoan != null ? latestLoan.getAddress() : null)
                .monthlyIncome(latestLoan != null ? latestLoan.getMonthlyIncome() : null)
                .creditScore(customer.getCreditScore() != null
                        ? customer.getCreditScore()
                        : (latestLoan != null ? latestLoan.getCreditScore() : null))
                .kycStatus(kyc != null ? kyc.getKycStatus() : KycStatus.PENDING)
                .aadhaarFile(kyc != null ? kyc.getAadhaarOriginalName() : null)
                .panFile(kyc != null ? kyc.getPanOriginalName() : null)
                .build();
    }

    public Long resolveUserIdFromEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    private KycDetails getKycForAccess(String requesterEmail, Role requesterRole, Long targetUserId) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (requesterRole == Role.CUSTOMER && !requester.getId().equals(targetUserId)) {
            throw new AccessDeniedException("You can only access your own KYC documents.");
        }

        if (requesterRole != Role.CUSTOMER && requesterRole != Role.LOAN_OFFICER && requesterRole != Role.ADMIN) {
            throw new AccessDeniedException("Unauthorized access to KYC documents.");
        }

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return kycRepository.findByUser(target)
                .filter(k -> k.getKycStatus() == KycStatus.COMPLETED)
                .orElseThrow(() -> new RuntimeException("KYC documents not found for this user."));
    }

    private KycResponse toKycResponse(KycDetails kyc) {
        return KycResponse.builder()
                .status(kyc.getKycStatus())
                .aadhaarFile(kyc.getAadhaarOriginalName())
                .panFile(kyc.getPanOriginalName())
                .build();
    }

    private void validateFile(MultipartFile file, String label) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException(label + " document is required.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException(label + " file must not exceed 5 MB.");
        }
        String ext = getExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new RuntimeException(label + " file must be PDF, JPG, JPEG, or PNG.");
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            throw new RuntimeException("Invalid file name.");
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }

    private Resource loadResource(String filePath, String downloadName) throws IOException {
        Path path = Paths.get(filePath);
        if (!Files.exists(path) || !Files.isReadable(path)) {
            throw new RuntimeException("Document file not found.");
        }
        final String fileName = downloadName != null && !downloadName.isBlank()
                ? downloadName
                : path.getFileName().toString();
        FileSystemResource resource = new FileSystemResource(path.toFile()) {
            @Override
            public String getFilename() {
                return fileName;
            }
        };
        if (!resource.exists() || !resource.isReadable()) {
            throw new RuntimeException("Document file not found.");
        }
        return resource;
    }

    private LoanApplication resolveLatestLoan(User customer) {
        List<LoanApplication> loans = loanApplicationRepository.findByCustomerOrderByAppliedAtDesc(customer);
        return loans.isEmpty() ? null : loans.get(0);
    }
}
