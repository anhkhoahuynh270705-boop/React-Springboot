package com.example.demo.util;

import java.time.LocalDateTime;

import com.example.demo.exception.BadRequestException;
import com.example.demo.model.Notification;

public final class NotificationUtils {

    private NotificationUtils() {
    }

    public static void validateUserId(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new BadRequestException("User ID is required");
        }
    }

    public static void validateNotification(Notification notification) {
        if (notification.getUserId() == null || notification.getUserId().trim().isEmpty()) {
            throw new BadRequestException("User ID is required");
        }

        if (notification.getTitle() == null || notification.getTitle().trim().isEmpty()) {
            throw new BadRequestException("Notification title is required");
        }

        if (notification.getMessage() == null || notification.getMessage().trim().isEmpty()) {
            throw new BadRequestException("Notification message is required");
        }
    }

    public static void applyCreateDefaults(Notification notification) {
        if (notification.getCreatedAt() == null) {
            notification.setCreatedAt(LocalDateTime.now());
        }

        if (notification.getIsRead() == null) {
            notification.setIsRead(false);
        }
    }

    public static void markAsRead(Notification notification) {
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
    }
}