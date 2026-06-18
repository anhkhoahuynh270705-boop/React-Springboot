package com.example.demo.util;

import com.example.demo.exception.BadRequestException;

public final class PasswordResetUtils {

    private PasswordResetUtils() {
    }

    public static void validateEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new BadRequestException("Email is required");
        }
    }

    public static void validateToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new BadRequestException("Token is required");
        }
    }

    public static void validateNewPassword(String newPassword) {
        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new BadRequestException("New password is required");
        }

        if (newPassword.length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters long");
        }
    }

    public static String buildResetUrl(String frontendUrl, String token) {
        return frontendUrl + "/reset-password?token=" + token;
    }
}