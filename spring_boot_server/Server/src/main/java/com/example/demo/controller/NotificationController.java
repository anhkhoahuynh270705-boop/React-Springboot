package com.example.demo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
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
import com.example.demo.service.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public List<Notification> getAllNotifications() {
        return notificationService.getAllNotifications();
    }

    @GetMapping("/{id}")
    public Notification getNotificationById(@PathVariable String id) {
        return notificationService.getNotificationById(id);
    }

    @GetMapping("/user/{userId}")
    public List<Notification> getNotificationsByUser(@PathVariable String userId) {
        return notificationService.getNotificationsByUser(userId);
    }

    @GetMapping("/user/{userId}/unread")
    public List<Notification> getUnreadNotificationsByUser(@PathVariable String userId) {
        return notificationService.getUnreadNotificationsByUser(userId);
    }

    @GetMapping("/user/{userId}/count")
    public Long getUnreadNotificationCount(@PathVariable String userId) {
        return notificationService.getUnreadNotificationCount(userId);
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        Notification savedNotification = notificationService.createNotification(notification);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedNotification);
    }

    @PutMapping("/{id}/read")
    public Notification markNotificationAsRead(@PathVariable String id) {
        return notificationService.markNotificationAsRead(id);
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<String> markAllNotificationsAsRead(@PathVariable String userId) {
        notificationService.markAllNotificationsAsRead(userId);
        return ResponseEntity.ok("All notifications marked as read");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNotification(@PathVariable String id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok("Notification deleted successfully");
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<String> deleteAllNotificationsByUser(@PathVariable String userId) {
        notificationService.deleteAllNotificationsByUser(userId);
        return ResponseEntity.ok("All notifications deleted successfully");
    }
}