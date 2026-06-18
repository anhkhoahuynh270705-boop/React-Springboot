package com.example.demo.controller;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.User;
import com.example.demo.service.GithubAuthService;
import com.example.demo.security.JwtService;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
@RestController
@RequestMapping("/api/auth/github")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class GithubAuthController {

    private final GithubAuthService githubAuthService;
    private final JwtService jwtService;

    @Value("${github.client.id}")
    private String clientId;

    @Value("${github.redirect.uri}")
    private String redirectUri;

    @Value("${frontend.url}")
    private String frontendUrl;

    @GetMapping
    public void redirectToGithub(HttpServletResponse response) throws IOException {
        String githubAuthUrl = "https://github.com/login/oauth/authorize"
                + "?client_id=" + clientId
                + "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8)
                + "&scope=user:email";

        response.sendRedirect(githubAuthUrl);
    }
    @GetMapping("/callback")
    public void githubCallback(@RequestParam String code, HttpServletResponse response) throws IOException {
        User user = githubAuthService.loginWithGithub(code);
        user.setPassword(null);
        String token = jwtService.generateToken(user);

        String redirectUrl = frontendUrl
                + "/github-login-success"
                + "?id=" + user.getId()
                + "&username=" + URLEncoder.encode(user.getUsername(), StandardCharsets.UTF_8)
                + "&email=" + URLEncoder.encode(user.getEmail() == null ? "" : user.getEmail(), StandardCharsets.UTF_8)
                + "&fullName=" + URLEncoder.encode(user.getFullName() == null ? "" : user.getFullName(), StandardCharsets.UTF_8)
                + "&avatarUrl=" + URLEncoder.encode(user.getAvatarUrl() == null ? "" : user.getAvatarUrl(), StandardCharsets.UTF_8)
                + "&token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);

        response.sendRedirect(redirectUrl);
    }
}