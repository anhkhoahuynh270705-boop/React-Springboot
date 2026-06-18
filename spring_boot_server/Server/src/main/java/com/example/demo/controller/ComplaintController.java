package com.example.demo.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Complaint;
import com.example.demo.service.ComplaintService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    // GET /api/complaints - Get all complaints (for admin)
    @GetMapping
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        try {
            List<Complaint> complaints = complaintService.getAllComplaints();
            return ResponseEntity.ok(complaints);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET /api/complaints/unread - Get unread complaints (for admin)
    @GetMapping("/unread")
    public ResponseEntity<List<Complaint>> getUnreadComplaints() {
        try {
            List<Complaint> unreadComplaints = complaintService.getUnreadComplaints();
            return ResponseEntity.ok(unreadComplaints);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET /api/complaints/status/{status} - Get complaints by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Complaint>> getComplaintsByStatus(@PathVariable String status) {
        try {
            List<Complaint> complaints = complaintService.getComplaintsByStatus(status);
            return ResponseEntity.ok(complaints);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET /api/complaints/{id} - Get complaint by ID
    @GetMapping("/{id}")
    public ResponseEntity<Complaint> getComplaintById(@PathVariable String id) {
        try {
            return complaintService.getComplaintById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

        // POST /api/complaints - Submit complaint
    @PostMapping
    public ResponseEntity<Map<String, Object>> submitComplaint(@RequestBody Complaint complaint) {
        try {
            Complaint savedComplaint = complaintService.submitComplaint(complaint);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Complaint submitted successfully");
            response.put("id", savedComplaint.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to submit complaint: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Update complaint status (for admin)
    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateComplaintStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            Optional<Complaint> updatedComplaint = complaintService.updateComplaintStatus(id, status);
            
            if (updatedComplaint.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Complaint status updated successfully");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to update complaint status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
