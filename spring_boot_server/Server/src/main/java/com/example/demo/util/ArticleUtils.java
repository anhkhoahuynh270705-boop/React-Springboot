package com.example.demo.util;

import java.time.LocalDateTime;

import com.example.demo.exception.BadRequestException;
import com.example.demo.model.Article;

public final class ArticleUtils {

    private ArticleUtils() {
    }

    public static void validateRequiredFields(Article article) {
        if (article.getTitle() == null || article.getTitle().trim().isEmpty()) {
            throw new BadRequestException("Title is required");
        }

        if (article.getContent() == null || article.getContent().trim().isEmpty()) {
            throw new BadRequestException("Content is required");
        }
    }

    public static void applyCreateDefaults(Article article) {
        if (article.getStatus() == null || article.getStatus().trim().isEmpty()) {
            article.setStatus("draft");
        }

        if (article.getIsActive() == null) {
            article.setIsActive(true);
        }

        if (article.getIsFeatured() == null) {
            article.setIsFeatured(false);
        }

        if (article.getViewCount() == null) {
            article.setViewCount(0);
        }

        if (article.getLikeCount() == null) {
            article.setLikeCount(0);
        }

        if (article.getShareCount() == null) {
            article.setShareCount(0);
        }

        LocalDateTime now = LocalDateTime.now();
        article.setCreatedAt(now);
        article.setUpdatedAt(now);

        if ("published".equals(article.getStatus()) && article.getPublishedAt() == null) {
            article.setPublishedAt(now);
        }
    }

    public static void applyUpdateMetadata(Article existingArticle, Article newArticle) {
        newArticle.setId(existingArticle.getId());
        newArticle.setCreatedAt(existingArticle.getCreatedAt());
        newArticle.setUpdatedAt(LocalDateTime.now());

        boolean oldStatusIsNotPublished = !"published".equals(existingArticle.getStatus());
        boolean newStatusIsPublished = "published".equals(newArticle.getStatus());

        if (newStatusIsPublished && oldStatusIsNotPublished) {
            newArticle.setPublishedAt(LocalDateTime.now());
        } else if (newArticle.getPublishedAt() == null) {
            newArticle.setPublishedAt(existingArticle.getPublishedAt());
        }
    }
}