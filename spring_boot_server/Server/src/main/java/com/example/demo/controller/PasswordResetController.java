package com.example.demo.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import com.example.demo.dto.ForgotPasswordRequest;
import com.example.demo.dto.ResetPasswordRequest;
import com.example.demo.dto.VerifyResetTokenRequest;
import com.example.demo.dto.VerifyResetTokenResponse;
import com.example.demo.service.PasswordResetService;
import com.example.demo.util.ResponseUtils;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public Map<String, Object> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String message = passwordResetService.forgotPassword(request.getEmail());
        return ResponseUtils.success(message);
    }

    @PostMapping("/reset-password")
    public Map<String, Object> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseUtils.success("Password has been reset successfully");
    }

    @PostMapping("/verify-reset-token")
    public VerifyResetTokenResponse verifyResetToken(@RequestBody VerifyResetTokenRequest request) {
        return passwordResetService.verifyResetToken(request.getToken());
    }
}