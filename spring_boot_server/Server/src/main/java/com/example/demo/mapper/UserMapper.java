package com.example.demo.mapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.example.demo.model.User;

public final class UserMapper {

    private UserMapper() {}

    public static Map<String, Object> toResponseMap(User user) {
        Map<String, Object> map = new HashMap<>();

        map.put("id", user.getId());
        map.put("username", user.getUsername());
        map.put("email", user.getEmail());
        map.put("fullName", user.getFullName());
        map.put("phone", user.getPhone());
        map.put("address", user.getAddress());
        map.put("notes", user.getNotes());
        map.put("avatar", user.getAvatar());
        map.put("avatarUrl", user.getAvatarUrl());
        map.put("provider", user.getProvider());
        map.put("createdAt", user.getCreatedAt());
        map.put("updatedAt", user.getUpdatedAt());
        map.put("lastLoginAt", user.getLastLoginAt());

        return map;
    }

    public static List<Map<String, Object>> toResponseMapList(List<User> users) {
        return users.stream().map(UserMapper::toResponseMap).toList();
    }
}