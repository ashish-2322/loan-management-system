package com.loanapp.loanmanagement.repository;

import com.loanapp.loanmanagement.entity.Notification;
import com.loanapp.loanmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    List<Notification> findByUserAndIsReadFalse(User user);
}