package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.TicketMapper;
import com.example.demo.mapper.UserMapper;
import com.example.demo.model.Ticket;
import com.example.demo.model.User;
import com.example.demo.repository.AdminRepository;
import com.example.demo.repository.TicketRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.ResponseUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminManagementService {

    private final AdminRepository adminRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public Map<String, Object> getAllTickets() {
        List<Ticket> tickets = ticketRepository.findAll();
        
        // Load all unique user details in a single query to prevent N+1 performance bottleneck
        List<String> userIds = tickets.stream()
                .map(Ticket::getUserId)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .toList();

        List<User> users = userRepository.findAllById(userIds);
        Map<String, User> userMap = users.stream()
                .collect(java.util.stream.Collectors.toMap(
                        User::getId,
                        java.util.function.Function.identity(),
                        (u1, u2) -> u1
                ));

        for (Ticket ticket : tickets) {
            if (ticket.getUserId() != null) {
                User user = userMap.get(ticket.getUserId());
                if (user != null) {
                    ticket.setUserName(user.getFullName());
                    ticket.setUserEmail(user.getEmail());
                }
            }
        }
        return ResponseUtils.success(null, "tickets", TicketMapper.toResponseMapList(tickets));
    }

    public Map<String, Object> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseUtils.success(null, "users",
                users.stream().map(UserMapper::toResponseMap).toList());
    }

    public Map<String, Object> getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return ResponseUtils.success(null, "user", UserMapper.toResponseMap(user));
    }

    public Map<String, Object> createUser(Map<String, Object> userData) {
        String username = (String) userData.get("username");
        String password = (String) userData.get("password");
        String fullName = (String) userData.get("fullName");
        String email = (String) userData.get("email");
        String phone = (String) userData.get("phone");
        String address = (String) userData.get("address");
        String notes = (String) userData.get("notes");

        if (username == null || username.trim().isEmpty()) {
            throw new BadRequestException("Username not be empty");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new BadRequestException("Password not be empty");
        }
        if (email == null || email.trim().isEmpty()) {
            throw new BadRequestException("Email not be empty");
        }
        if (userRepository.existsByUsername(username)) {
            throw new BadRequestException("Username has existed");
        }
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email has existed");
        }

        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPassword(password);
        newUser.setFullName(fullName);
        newUser.setEmail(email);
        newUser.setPhone(phone);
        newUser.setAddress(address);
        newUser.setNotes(notes);
        newUser.setCreatedAt(LocalDateTime.now());
        newUser.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(newUser);
        return ResponseUtils.success("Create user successfully", "user", UserMapper.toResponseMap(savedUser));
    }

    public Map<String, Object> updateUser(String userId, Map<String, Object> userData) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (userData.containsKey("fullName")) {
            user.setFullName((String) userData.get("fullName"));
        }
        if (userData.containsKey("email")) {
            String newEmail = (String) userData.get("email");
            if (newEmail != null && !newEmail.equals(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                throw new BadRequestException("Email has existed");
            }
            user.setEmail(newEmail);
        }
        if (userData.containsKey("phone")) {
            user.setPhone((String) userData.get("phone"));
        }
        if (userData.containsKey("address")) {
            user.setAddress((String) userData.get("address"));
        }
        if (userData.containsKey("notes")) {
            user.setNotes((String) userData.get("notes"));
        }

        user.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(user);
        return ResponseUtils.success("Update user successfully", "user", UserMapper.toResponseMap(updatedUser));
    }

    public Map<String, Object> deleteUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        userRepository.deleteById(userId);
        return ResponseUtils.success("Delete user successfully");
    }

    public Map<String, Object> searchUsers(String keyword) {
        String lowerKeyword = keyword == null ? "" : keyword.toLowerCase();
        List<User> users = userRepository.findAll().stream()
                .filter(user ->
                        containsIgnoreCase(user.getUsername(), lowerKeyword) ||
                        containsIgnoreCase(user.getFullName(), lowerKeyword) ||
                        containsIgnoreCase(user.getEmail(), lowerKeyword))
                .toList();
        return ResponseUtils.success(null, "users",
                users.stream().map(UserMapper::toResponseMap).toList());
    }

    public Map<String, Object> updateTicketStatus(String ticketId, Map<String, String> statusData) {
        String newStatus = statusData.get("status");
        if (newStatus == null || newStatus.trim().isEmpty()) {
            throw new BadRequestException("Status is required");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        ticket.setStatus(newStatus);
        ticketRepository.save(ticket);

        return ResponseUtils.success("Update ticket status successfully", "ticket", TicketMapper.toResponseMap(ticket));
    }

    private boolean containsIgnoreCase(String value, String keyword) {
        return value != null && value.toLowerCase().contains(keyword);
    }
}
