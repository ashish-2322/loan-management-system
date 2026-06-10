package com.loanapp.loanmanagement.service;

import com.loanapp.loanmanagement.dto.*;
import com.loanapp.loanmanagement.entity.User;
import com.loanapp.loanmanagement.enums.Role;
import com.loanapp.loanmanagement.entity.CreditScore;
import com.loanapp.loanmanagement.repository.CreditScoreRepository;
import com.loanapp.loanmanagement.repository.UserRepository;
import com.loanapp.loanmanagement.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final CreditScoreRepository creditScoreRepository;
    private final CibilScoreService cibilScoreService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;

    public String register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            throw new RuntimeException("Email already registered");
        if (userRepository.existsByMobileNumber(request.getMobileNumber()))
            throw new RuntimeException("Mobile number already registered");

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .mobileNumber(request.getMobileNumber())
                .role(request.getRole() != null
                  ?Role.valueOf(request.getRole().toUpperCase())
                  :Role.CUSTOMER)
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .build();
        userRepository.save(user);
        assignCreditScoresFromCibil(user);
        userRepository.save(user);
        return "Registration successful";
    }

    public String sendLoginOtp(String mobileNumber) {
        return otpService.generateOtp(mobileNumber);
    }

    public AuthResponse verifyOtpAndLogin(LoginRequest request) {
        if (!otpService.verifyOtp(request.getMobileNumber(), request.getOtp()))
            throw new RuntimeException("Invalid or expired OTP");

        User user = userRepository.findByMobileNumber(request.getMobileNumber())
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setOtp(null);
        user.setOtpExpiry(null);

        if (user.getCreditScore() == null && user.getRole() == Role.CUSTOMER) {
            assignCreditScoresFromCibil(user);
        }

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getRole().name(), "Login successful", user.getFullName());
    }

    private void assignCreditScoresFromCibil(User user) {
        int score = cibilScoreService.getScoreByCustomerId(user.getId());
        user.setCreditScore(score);
        if (!creditScoreRepository.findByMobileNumber(user.getMobileNumber()).isPresent()) {
            creditScoreRepository.save(CreditScore.builder()
                    .mobileNumber(user.getMobileNumber())
                    .score(score)
                    .build());
        }
    }
}