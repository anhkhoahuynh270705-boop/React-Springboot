package com.example.demo.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.example.demo.dto.BookingConfirmationEmailDto;
import com.example.demo.util.EmailTemplateUtils;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendPasswordResetEmail(String to, String resetUrl) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Reset Your Password - HAK Cinema");
            helper.setText(EmailTemplateUtils.passwordResetBody(resetUrl), true);
            helper.setFrom("noreply@hakcinema.com");

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    public void sendPasswordResetSuccessEmail(String to) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Password Reset Successful - HAK Cinema");
            helper.setText(EmailTemplateUtils.passwordResetSuccessBody(), true);
            helper.setFrom("noreply@hakcinema.com");

            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to send password reset success email: " + e.getMessage());
        }
    }

    public void sendBookingConfirmationEmail(BookingConfirmationEmailDto dto) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(dto.getTo());
            helper.setSubject(" Booking Confirmed - " + dto.getMovieTitle() + " | HAK CINEVERSE");
            helper.setText(EmailTemplateUtils.bookingConfirmationBody(dto), true);
            helper.setFrom("noreply@hakcinema.com");

            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to send booking confirmation email: " + e.getMessage());
        }
    }
}