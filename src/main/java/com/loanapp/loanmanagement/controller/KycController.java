package com.loanapp.loanmanagement.controller;

import com.loanapp.loanmanagement.enums.Role;
import com.loanapp.loanmanagement.service.KycService;
import com.loanapp.loanmanagement.util.FileResponseUtil;
import com.loanapp.loanmanagement.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/kyc")
@RequiredArgsConstructor
public class KycController {

    private final KycService kycService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadKyc(@RequestParam("aadhaarFile") MultipartFile aadhaarFile,
                                       @RequestParam("panFile") MultipartFile panFile,
                                       Authentication auth) {
        try {
            return ResponseEntity.ok(kycService.uploadKyc(auth.getName(), aadhaarFile, panFile));
        } catch (AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ResponseUtil.error(ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponseUtil.error(ex.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyKyc(Authentication auth) {
        return ResponseEntity.ok(kycService.getMyKyc(auth.getName()));
    }

    @GetMapping("/aadhaar")
    public ResponseEntity<Resource> downloadAadhaar(Authentication auth,
                                                    @RequestParam(defaultValue = "false") boolean inline) throws Exception {
        Long userId = kycService.resolveUserIdFromEmail(auth.getName());
        Role role = resolveRole(auth);
        Resource resource = kycService.loadAadhaarForUser(auth.getName(), role, userId);
        String fileName = kycService.getAadhaarOriginalName(auth.getName(), role, userId);
        return FileResponseUtil.build(resource, fileName, inline);
    }

    @GetMapping("/pan")
    public ResponseEntity<Resource> downloadPan(Authentication auth,
                                                @RequestParam(defaultValue = "false") boolean inline) throws Exception {
        Long userId = kycService.resolveUserIdFromEmail(auth.getName());
        Role role = resolveRole(auth);
        Resource resource = kycService.loadPanForUser(auth.getName(), role, userId);
        String fileName = kycService.getPanOriginalName(auth.getName(), role, userId);
        return FileResponseUtil.build(resource, fileName, inline);
    }

    private Role resolveRole(Authentication auth) {
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> Role.valueOf(a.substring(5)))
                .findFirst()
                .orElse(Role.CUSTOMER);
    }
}
