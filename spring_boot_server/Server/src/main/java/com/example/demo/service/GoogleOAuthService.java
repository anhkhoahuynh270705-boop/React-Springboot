package com.example.demo.service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

@Service
public class GoogleOAuthService {

    private final GoogleIdTokenVerifier verifier;

    public GoogleOAuthService(@Value("${google.client-id}") String clientId) {
        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(clientId))
                .build();
    }

    public GoogleUserInfo verifyAndExtractUserInfo(String idTokenString) {
        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) return null;

            GoogleIdToken.Payload payload = idToken.getPayload();
            return new GoogleUserInfo(
                    payload.getSubject(),
                    payload.getEmail(),
                    (String) payload.get("name"),
                    (String) payload.get("picture")
            );
        } catch (GeneralSecurityException | IOException e) {
            System.err.println("Error verifying Google ID token: " + e.getMessage());
            return null;
        }
    }

    public static class GoogleUserInfo {
        private final String googleId;
        private final String email;
        private final String name;
        private final String pictureUrl;

        public GoogleUserInfo(String googleId, String email, String name, String pictureUrl) {
            this.googleId = googleId;
            this.email = email;
            this.name = name;
            this.pictureUrl = pictureUrl;
        }

        public String getGoogleId()   { return googleId; }
        public String getEmail()      { return email; }
        public String getName()       { return name; }
        public String getPictureUrl() { return pictureUrl; }
    }
}
