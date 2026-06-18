package com.example.demo.util;

import java.util.HashMap;
import java.util.Map;

public final class ResponseUtils {

    private ResponseUtils() {}

    public static Map<String, Object> success(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        if (message != null) {
            response.put("message", message);
        }
        return response;
    }

    public static Map<String, Object> success(String message, String key, Object value) {
        Map<String, Object> response = success(message);
        response.put(key, value);
        return response;
    }

    public static Map<String, Object> data(String key, Object value) {
        Map<String, Object> response = success(null);
        response.put(key, value);
        return response;
    }
}
