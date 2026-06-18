package com.example.demo.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Contact;

@Repository
public interface ContactRepository extends MongoRepository<Contact, String> {
    List<Contact> findByIsRead(boolean isRead);
    List<Contact> findByEmail(String email);
    List<Contact> findAllByOrderByCreatedAtDesc();
}

