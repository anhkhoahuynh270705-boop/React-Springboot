package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.News;
import com.example.demo.repository.NewsRepository;
import com.example.demo.util.NewsUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsRepository newsRepository;

    public Map<String, Object> getAllNews(
            int page,
            int size,
            String category,
            Boolean featured,
            String search) {

        NewsUtils.validatePagination(page, size);

        List<News> news = findFilteredNews(category, featured, search);

        long totalElements = news.size();
        List<News> pagedNews = NewsUtils.paginate(news, page, size);

        Map<String, Object> result = new HashMap<>();
        result.put("news", pagedNews);
        result.put("totalElements", totalElements);
        result.put("totalPages", NewsUtils.totalPages(totalElements, size));
        result.put("currentPage", page);
        result.put("size", size);

        return result;
    }

    private List<News> findFilteredNews(String category, Boolean featured, String search) {
        if (search != null && !search.trim().isEmpty()) {
            return newsRepository.searchNews(search.trim());
        }

        if (category != null && !category.trim().isEmpty()) {
            if (featured != null) {
                return newsRepository.findByCategoryAndFeaturedOrderByPublishDateDesc(category, featured);
            }

            return newsRepository.findByCategoryOrderByPublishDateDesc(category);
        }

        if (featured != null) {
            if (Boolean.TRUE.equals(featured)) {
                return newsRepository.findByFeaturedTrueOrderByPublishDateDesc();
            }

            return newsRepository.findAllByOrderByPublishDateDesc()
                    .stream()
                    .filter(news -> !Boolean.TRUE.equals(news.getFeatured()))
                    .toList();
        }

        return newsRepository.findAllByOrderByPublishDateDesc();
    }

    public News getNewsById(String id) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("News", "id", id));

        news.incrementViews();
        return newsRepository.save(news);
    }

    public List<News> getFeaturedNews() {
        return newsRepository.findByFeaturedTrueOrderByPublishDateDesc();
    }

    public List<News> getNewsByCategory(String category) {
        return newsRepository.findByCategoryOrderByPublishDateDesc(category);
    }

    public List<News> searchNews(String q) {
        if (q == null || q.trim().isEmpty()) {
            throw new BadRequestException("Search keyword is required");
        }

        return newsRepository.searchNews(q.trim());
    }

    public List<String> getNewsCategories() {
        return newsRepository.findAll()
                .stream()
                .map(News::getCategory)
                .filter(category -> category != null && !category.trim().isEmpty())
                .distinct()
                .sorted()
                .toList();
    }

    public List<News> getPopularNews() {
        return newsRepository.findTop10ByOrderByViewsDesc();
    }

    public List<News> getRecentNews() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return newsRepository.findRecentNews(thirtyDaysAgo);
    }

    public News createNews(News news) {
        NewsUtils.validateRequiredFields(news);

        news.setDefaultValues();

        if (news.getPublishDate() == null) {
            news.setPublishDate(LocalDateTime.now());
        }

        return newsRepository.save(news);
    }

    public News updateNews(String id, News newsDetails) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("News", "id", id));

        NewsUtils.validateRequiredFields(newsDetails);

        news.setTitle(newsDetails.getTitle());
        news.setSummary(newsDetails.getSummary());
        news.setContent(newsDetails.getContent());
        news.setAuthor(newsDetails.getAuthor());
        news.setCategory(newsDetails.getCategory());
        news.setTags(newsDetails.getTags());
        news.setImageUrl(newsDetails.getImageUrl());
        news.setFeatured(newsDetails.getFeatured());

        if (newsDetails.getPublishDate() != null) {
            news.setPublishDate(newsDetails.getPublishDate());
        }

        news.updateTimestamp();

        return newsRepository.save(news);
    }

    public void deleteNews(String id) {
        if (!newsRepository.existsById(id)) {
            throw new ResourceNotFoundException("News", "id", id);
        }

        newsRepository.deleteById(id);
    }
}