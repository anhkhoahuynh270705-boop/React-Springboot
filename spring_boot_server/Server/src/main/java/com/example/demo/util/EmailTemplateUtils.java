package com.example.demo.util;

public final class EmailTemplateUtils {

    private EmailTemplateUtils() {
    }

    public static String passwordResetBody(String resetUrl) {
        return String.format(
                "Hello,\n\n" +
                "You have requested to reset your password for your HAK Cinema account.\n\n" +
                "Please click on the following link to reset your password:\n" +
                "%s\n\n" +
                "This link will expire in 15 minutes.\n\n" +
                "If you did not request a password reset, please ignore this email.\n\n" +
                "Best regards,\n" +
                "HAK Cinema Team",
                resetUrl
        );
    }

    public static String passwordResetSuccessBody() {
        return "Hello,\n\n" +
                "Your password has been successfully reset.\n\n" +
                "If you did not make this change, please contact us immediately.\n\n" +
                "Best regards,\n" +
                "HAK Cinema Team";
    }
}