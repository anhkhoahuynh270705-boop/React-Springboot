package com.example.demo.util;

import java.util.List;

import com.example.demo.exception.BadRequestException;
import com.example.demo.model.News;

public final class NewsUtils {

    private NewsUtils() {
    }

    public static void validateRequiredFields(News news) {
        if (news.getTitle() == null || news.getTitle().trim().isEmpty()) {
            throw new BadRequestException("News title is required");
        }

        if (news.getContent() == null || news.getContent().trim().isEmpty()) {
            throw new BadRequestException("News content is required");
        }
    }

    public static void validatePagination(int page, int size) {
        if (page < 0) {
            throw new BadRequestException("Page must be greater than or equal to 0");
        }

        if (size <= 0) {
            throw new BadRequestException("Size must be greater than 0");
        }
    }

    public static List<News> paginate(List<News> news, int page, int size) {
        int start = page * size;
        int end = Math.min(start + size, news.size());

        if (start >= news.size()) {
            return List.of();
        }

        return news.subList(start, end);
    }

    public static int totalPages(long totalElements, int size) {
        return (int) Math.ceil((double) totalElements / size);
    }
}