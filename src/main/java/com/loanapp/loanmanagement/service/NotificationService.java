package com.loanapp.loanmanagement.service;

import com.loanapp.loanmanagement.entity.*;
import com.loanapp.loanmanagement.repository.NotificationRepository;
import com.loanapp.loanmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepo;
    private final UserRepository userRepository;

    public void createNotification(User user, String message) {
        Notification n = Notification.builder().user(user).message(message).build();
        notificationRepo.save(n);
    }

    public List<Notification> getUserNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepo.findByUserOrderByCreatedAtDesc(user);
    }

    public void markAllRead(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        notificationRepo.findByUserAndIsReadFalse(user)
                .forEach(notification -> {
                    notification.setRead(true);
                    notificationRepo.save(notification);
                });
    }
}