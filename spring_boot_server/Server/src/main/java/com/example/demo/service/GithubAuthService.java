package com.example.demo.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class GithubAuthService {

    @Value("${github.client.id}")
    private String clientId;

    @Value("${github.client.secret}")
    private String clientSecret;

    private final UserRepository userRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @SuppressWarnings({ "rawtypes", "unchecked" })
    public User loginWithGithub(String code) {
        String tokenUrl = "https://github.com/login/oauth/access_token";

        HttpHeaders tokenHeaders = new HttpHeaders();
        tokenHeaders.setContentType(MediaType.APPLICATION_JSON);
        tokenHeaders.setAccept(List.of(MediaType.APPLICATION_JSON));

        Map<String, String> tokenBody = new HashMap<>();
        tokenBody.put("client_id", clientId);
        tokenBody.put("client_secret", clientSecret);
        tokenBody.put("code", code);

        HttpEntity<Map<String, String>> tokenRequest =
                new HttpEntity<>(tokenBody, tokenHeaders);

        ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(
                tokenUrl,
                tokenRequest,
                Map.class
        );

        String accessToken = (String) tokenResponse.getBody().get("access_token");

        HttpHeaders userHeaders = new HttpHeaders();
        userHeaders.setBearerAuth(accessToken);
        userHeaders.setAccept(List.of(MediaType.APPLICATION_JSON));

        HttpEntity<Void> userRequest = new HttpEntity<>(userHeaders);

        ResponseEntity<Map> userResponse = restTemplate.exchange(
                "https://api.github.com/user",
                HttpMethod.GET,
                userRequest,
                Map.class
        );

        Map<String, Object> githubUser = userResponse.getBody();

        String githubId = String.valueOf(githubUser.get("id"));
        String username = (String) githubUser.get("login");
        String fullName = (String) githubUser.get("name");
        String avatarUrl = (String) githubUser.get("avatar_url");

        Optional<User> existingUser = userRepository.findByGithubId(githubId);

        if (existingUser.isPresent()) {
            return existingUser.get();
        }

        User user = new User();
        user.setGithubId(githubId);
        user.setUsername(username);
        user.setFullName(fullName != null ? fullName : username);
        user.setAvatarUrl(avatarUrl);
        user.setProvider("GITHUB");

        return userRepository.save(user);
    }
}