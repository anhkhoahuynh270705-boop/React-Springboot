package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.model.Complaint;
import com.example.demo.repository.ComplaintRepository;

import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;

    public Complaint submitComplaint(Complaint complaint) {
        if (complaint.getName() == null || complaint.getName().trim().isEmpty() ||
            complaint.getEmail() == null || complaint.getEmail().trim().isEmpty() ||
            complaint.getDescription() == null || complaint.getDescription().trim().isEmpty() ||
            complaint.getCategory() == null || complaint.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("Name, email, category, and description are required");
        }

        if (complaint.getStatus() == null || complaint.getStatus().trim().isEmpty()) {
            complaint.setStatus("pending");
        }
        if (complaint.getCreatedAt() == null) {
            complaint.setCreatedAt(LocalDateTime.now());
        }
        complaint.setRead(false);

        return complaintRepository.save(complaint);
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Complaint> getUnreadComplaints() {
        return complaintRepository.findByIsRead(false);
    }

    public List<Complaint> getComplaintsByStatus(String status) {
        return complaintRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    public Optional<Complaint> getComplaintById(String id) {
        return complaintRepository.findById(id);
    }

    public Optional<Complaint> updateComplaintStatus(String id, String status) {
        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Status is required");
        }

        return complaintRepository.findById(id).map(complaint -> {
            complaint.setStatus(status);
            complaint.setUpdatedAt(LocalDateTime.now());
            return complaintRepository.save(complaint);
        });
    }
}
