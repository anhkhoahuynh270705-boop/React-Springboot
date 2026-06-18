package com.example.demo.service;

import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Notification;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.util.NotificationUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public Notification getNotificationById(String id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
    }

    public List<Notification> getNotificationsByUser(String userId) {
        NotificationUtils.validateUserId(userId);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotificationsByUser(String userId) {
        NotificationUtils.validateUserId(userId);
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    public Long getUnreadNotificationCount(String userId) {
        NotificationUtils.validateUserId(userId);
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public Notification createNotification(Notification notification) {
        NotificationUtils.validateNotification(notification);
        NotificationUtils.applyCreateDefaults(notification);

        Notification saved = notificationRepository.save(notification);

        // Push real-time notification to the specific user via WebSocket
        pushToUser(saved.getUserId(), saved);

        return saved;
    }

    public Notification markNotificationAsRead(String id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));

        NotificationUtils.markAsRead(notification);

        return notificationRepository.save(notification);
    }

    public void markAllNotificationsAsRead(String userId) {
        NotificationUtils.validateUserId(userId);

        List<Notification> unreadNotifications =
                notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);

        unreadNotifications.forEach(NotificationUtils::markAsRead);

        notificationRepository.saveAll(unreadNotifications);
    }

    public void deleteNotification(String id) {
        if (!notificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notification", "id", id);
        }

        notificationRepository.deleteById(id);
    }

    public void deleteAllNotificationsByUser(String userId) {
        NotificationUtils.validateUserId(userId);

        List<Notification> userNotifications =
                notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);

        notificationRepository.deleteAll(userNotifications);
    }

    // Push real-time notification to a specific user's private channel
    public void pushToUser(String userId, Object payload) {
        try {
            messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", payload);
        } catch (Exception e) {
            System.err.println("Failed to push notification to user " + userId + ": " + e.getMessage());
        }
    }
}