package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.model.Contact;
import com.example.demo.repository.ContactRepository;

import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;

    public Contact submitContact(Contact contact) {
        if (contact.getName() == null || contact.getName().trim().isEmpty() ||
            contact.getEmail() == null || contact.getEmail().trim().isEmpty() ||
            contact.getMessage() == null || contact.getMessage().trim().isEmpty()) {
            throw new IllegalArgumentException("Name, email, and message are required");
        }
        
        // Ensure default values if any, for example createdAt
        if (contact.getCreatedAt() == null) {
            contact.setCreatedAt(LocalDateTime.now());
        }

        return contactRepository.save(contact);
    }

    public List<Contact> getAllContacts() {
        return contactRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Contact> getUnreadContacts() {
        return contactRepository.findByIsRead(false);
    }
}
