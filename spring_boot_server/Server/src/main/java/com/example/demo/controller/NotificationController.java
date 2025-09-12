package com.example.demo.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Notification;
import com.example.demo.repository.NotificationRepository;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public List<Notification> getAllNotifications() {
        System.out.println("Getting all notifications for debugging");
        List<Notification> allNotifications = notificationRepository.findAll();
        System.out.println("Total notifications in database: " + allNotifications.size());
        for (Notification n : allNotifications) {
            System.out.println("Notification ID: " + n.getId() + ", User ID: " + n.getUserId() + ", Read: " + n.isRead());
        }
        return allNotifications;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getNotificationById(@PathVariable String id) {
        System.out.println("Getting notification by ID: " + id);
        Optional<Notification> notification = notificationRepository.findById(id);
        if (notification.isPresent()) {
            System.out.println("Found notification: " + notification.get());
            return ResponseEntity.ok(notification.get());
        } else {
            System.out.println("Notification not found with ID: " + id);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        System.out.println("Test endpoint called");
        try {
            long count = notificationRepository.count();
            System.out.println("Total notifications in database: " + count);
            return ResponseEntity.ok().body("Database connection OK. Total notifications: " + count);
        } catch (Exception e) {
            System.err.println("Database error: " + e.getMessage());
            return ResponseEntity.status(500).body("Database error: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public List<Notification> getNotificationsByUser(@PathVariable String userId) {
        System.out.println("Getting notifications for user: " + userId);
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        System.out.println("Found " + notifications.size() + " notifications for user: " + userId);
        return notifications;
    }

    @GetMapping("/user/{userId}/unread")
    public List<Notification> getUnreadNotificationsByUser(@PathVariable String userId) {
        return notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
    }

    @GetMapping("/user/{userId}/count")
    public long getUnreadNotificationCount(@PathVariable String userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }

    @PostMapping
    public Notification createNotification(@RequestBody Notification notification) {
        if (notification.getCreatedAt() == null) {
            notification.setCreatedAt(java.time.LocalDateTime.now());
        }
        return notificationRepository.save(notification);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String id) {
        try {
            System.out.println("Marking notification as read: " + id);
            Optional<Notification> notificationOpt = notificationRepository.findById(id);
            if (notificationOpt.isPresent()) {
                Notification notification = notificationOpt.get();
                System.out.println("Found notification: " + notification.getTitle() + " - Read: " + notification.isRead());
                notification.setRead(true);
                notification.setReadAt(java.time.LocalDateTime.now());
                Notification saved = notificationRepository.save(notification);
                System.out.println("Successfully marked notification as read: " + id);
                return ResponseEntity.ok(saved);
            } else {
                System.out.println("Notification not found: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error marking notification as read: " + e.getMessage());
            return ResponseEntity.status(500).body("Lỗi khi đánh dấu thông báo đã đọc: " + e.getMessage());
        }
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<?> markAllAsRead(@PathVariable String userId) {
        try {
            System.out.println("Marking all notifications as read for user: " + userId);
            List<Notification> notifications = notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
            System.out.println("Found " + notifications.size() + " unread notifications");
            
            for (Notification notification : notifications) {
                notification.setRead(true);
                notification.setReadAt(java.time.LocalDateTime.now());
            }
            
            if (!notifications.isEmpty()) {
                notificationRepository.saveAll(notifications);
                System.out.println("Successfully marked " + notifications.size() + " notifications as read");
            }
            return ResponseEntity.ok().body("Successfully marked " + notifications.size() + " notifications as read");
        } catch (Exception e) {
            System.err.println("Error marking all notifications as read: " + e.getMessage());
            return ResponseEntity.status(500).body("Lỗi khi đánh dấu tất cả thông báo đã đọc: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public void deleteNotification(@PathVariable String id) {
        notificationRepository.deleteById(id);
    }

    @DeleteMapping("/user/{userId}")
    public void deleteAllNotificationsByUser(@PathVariable String userId) {
        notificationRepository.deleteByUserId(userId);
    }
}
