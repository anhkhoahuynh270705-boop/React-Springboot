package com.example.demo.mapper;

import java.util.HashMap;
import java.util.Map;

import com.example.demo.model.Article;

public final class ArticleMapper {

    private ArticleMapper() {
    }

    public static Map<String, Object> toResponseMap(Article article) {
        Map<String, Object> response = new HashMap<>();

        response.put("id", article.getId());
        response.put("title", article.getTitle());
        response.put("content", article.getContent());
        response.put("status", article.getStatus());
        response.put("isActive", article.getIsActive());
        response.put("isFeatured", article.getIsFeatured());
        response.put("viewCount", article.getViewCount());
        response.put("likeCount", article.getLikeCount());
        response.put("shareCount", article.getShareCount());
        response.put("createdAt", article.getCreatedAt());
        response.put("updatedAt", article.getUpdatedAt());
        response.put("publishedAt", article.getPublishedAt());

        return response;
    }
}