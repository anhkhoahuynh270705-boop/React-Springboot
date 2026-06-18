package com.example.demo.mapper;

import java.util.HashMap;
import java.util.Map;

import com.example.demo.model.Admin;
public final class AdminMapper {
    private AdminMapper() {}
    public static Map<String, Object> toResponseMap(Admin admin) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", admin.getId());
        response.put("username", admin.getUsername());
        response.put("fullName", admin.getFullName());
        response.put("email", admin.getEmail());
        response.put("phone", admin.getPhone());
        response.put("role", admin.getRole());
        response.put("createdAt", admin.getCreatedAt());
        response.put("lastLoginAt", admin.getLastLoginAt());
        response.put("notes", admin.getNotes());
        return response;
    }
}
