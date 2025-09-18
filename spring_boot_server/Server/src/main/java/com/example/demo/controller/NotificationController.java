package com.example.demo.controller;

import java.time.LocalDateTime;
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

    // Lấy tất cả thông báo
    @GetMapping
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    // Lấy thông báo theo ID
    @GetMapping("/{id}")
    public Optional<Notification> getNotificationById(@PathVariable String id) {
        return notificationRepository.findById(id);
    }

    // Lấy thông báo của user
    @GetMapping("/user/{userId}")
    public List<Notification> getNotificationsByUser(@PathVariable String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Lấy thông báo chưa đọc của user
    @GetMapping("/user/{userId}/unread")
    public List<Notification> getUnreadNotificationsByUser(@PathVariable String userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    // Lấy số lượng thông báo chưa đọc
    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Long> getUnreadNotificationCount(@PathVariable String userId) {
        Long count = notificationRepository.countByUserIdAndIsReadFalse(userId);
        return ResponseEntity.ok(count);
    }

    // Tạo thông báo mới
    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        try {
            // Set default values
            if (notification.getCreatedAt() == null) {
                notification.setCreatedAt(LocalDateTime.now());
            }
            if (notification.getIsRead() == null) {
                notification.setIsRead(false);
            }
            
            Notification savedNotification = notificationRepository.save(notification);
            return ResponseEntity.ok(savedNotification);
        } catch (Exception e) {
            System.err.println("Error creating notification: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // Đánh dấu thông báo là đã đọc
    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markNotificationAsRead(@PathVariable String id) {
        try {
            Optional<Notification> notificationOpt = notificationRepository.findById(id);
            if (!notificationOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Notification notification = notificationOpt.get();
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            
            Notification updatedNotification = notificationRepository.save(notification);
            return ResponseEntity.ok(updatedNotification);
        } catch (Exception e) {
            System.err.println("Error marking notification as read: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // Đánh dấu tất cả thông báo của user là đã đọc
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<String> markAllNotificationsAsRead(@PathVariable String userId) {
        try {
            List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
            
            for (Notification notification : unreadNotifications) {
                notification.setIsRead(true);
                notification.setReadAt(LocalDateTime.now());
            }
            
            notificationRepository.saveAll(unreadNotifications);
            return ResponseEntity.ok("All notifications marked as read");
        } catch (Exception e) {
            System.err.println("Error marking all notifications as read: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error marking all notifications as read");
        }
    }

    // Xóa thông báo
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNotification(@PathVariable String id) {
        try {
            if (!notificationRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            
            notificationRepository.deleteById(id);
            return ResponseEntity.ok("Notification deleted successfully");
        } catch (Exception e) {
            System.err.println("Error deleting notification: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error deleting notification");
        }
    }

    // Xóa tất cả thông báo của user
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<String> deleteAllNotificationsByUser(@PathVariable String userId) {
        try {
            List<Notification> userNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
            notificationRepository.deleteAll(userNotifications);
            return ResponseEntity.ok("All notifications deleted successfully");
        } catch (Exception e) {
            System.err.println("Error deleting all notifications: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error deleting all notifications");
        }
    }
}