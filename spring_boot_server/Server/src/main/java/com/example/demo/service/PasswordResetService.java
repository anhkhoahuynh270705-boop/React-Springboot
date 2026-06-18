package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.demo.dto.VerifyResetTokenResponse;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.PasswordResetToken;
import com.example.demo.model.User;
import com.example.demo.repository.PasswordResetTokenRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.PasswordResetUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public String forgotPassword(String email) {
        PasswordResetUtils.validateEmail(email);

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return "If an account with that email exists, a password reset link has been sent.";
        }

        User user = userOpt.get();

        tokenRepository.deleteByUserId(user.getId());

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user.getId());

        tokenRepository.save(resetToken);

        String resetUrl = PasswordResetUtils.buildResetUrl(frontendUrl, token);

        emailService.sendPasswordResetEmail(user.getEmail(), resetUrl);

        return "Password reset link has been sent to your email.";
    }

    public void resetPassword(String token, String newPassword) {
        PasswordResetUtils.validateToken(token);
        PasswordResetUtils.validateNewPassword(newPassword);

        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(resetToken);
            throw new BadRequestException("Reset token has expired. Please request a new one.");
        }

        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", resetToken.getUserId()));

        user.setPassword(newPassword);
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        tokenRepository.delete(resetToken);

        emailService.sendPasswordResetSuccessEmail(user.getEmail());
    }

    public VerifyResetTokenResponse verifyResetToken(String token) {
        PasswordResetUtils.validateToken(token);

        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);

        if (tokenOpt.isEmpty()) {
            return new VerifyResetTokenResponse(false, "Invalid token");
        }

        PasswordResetToken resetToken = tokenOpt.get();

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return new VerifyResetTokenResponse(false, "Token has expired");
        }

        return new VerifyResetTokenResponse(true, "Token is valid");
    }
}