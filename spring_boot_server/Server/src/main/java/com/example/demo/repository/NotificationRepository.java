package com.example.demo.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Notification;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(String userId);
    Long countByUserIdAndIsReadFalse(String userId);
    List<Notification> findByTypeOrderByCreatedAtDesc(String type);
    List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(String userId, String type);
}