package com.example.demo.repository;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.demo.model.Notification;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Notification> findByUserIdAndIsReadOrderByCreatedAtDesc(String userId, boolean isRead);
    long countByUserIdAndIsRead(String userId, boolean isRead);
    void deleteByUserId(String userId);
}
