package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.User;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByUsernameAndPassword(String username, String password);
    Optional<User> findByGoogleId(String googleId);
    Optional<User> findByGithubId(String githubId);
    Optional<User> findByEmailAndProvider(String email, String provider);
    
    List<User> findByFaceDescriptorExists(boolean exists);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByGoogleId(String googleId);
    boolean existsByGithubId(String githubId);
}