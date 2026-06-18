package com.example.demo.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.example.demo.util.EmailTemplateUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendPasswordResetEmail(String to, String resetUrl) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Reset Your Password - HAK Cinema");
        message.setText(EmailTemplateUtils.passwordResetBody(resetUrl));
        message.setFrom("noreply@hakcinema.com");

        mailSender.send(message);
    }

    public void sendPasswordResetSuccessEmail(String to) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Password Reset Successful - HAK Cinema");
            message.setText(EmailTemplateUtils.passwordResetSuccessBody());
            message.setFrom("noreply@hakcinema.com");

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send password reset success email: " + e.getMessage());
        }
    }
}