package com.loanapp.loanmanagement.service;

import com.loanapp.loanmanagement.entity.User;
import com.loanapp.loanmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {
    private final UserRepository userRepository;

    public String generateOtp(String mobileNumber) {
        User user = userRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new RuntimeException("Mobile number not registered"));
        String otp = String.valueOf(100000 + new Random().nextInt(900000));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(1));
        userRepository.save(user);
        // In real project: send OTP via SMS gateway (e.g. Twilio)
        System.out.println("OTP for " + mobileNumber + ": " + otp); // for testing
        return "OTP sent successfully";
    }

    public boolean verifyOtp(String mobileNumber, String otp) {
        User user = userRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getOtp() != null
                && user.getOtp().equals(otp)
                && LocalDateTime.now().isBefore(user.getOtpExpiry());
    }
}