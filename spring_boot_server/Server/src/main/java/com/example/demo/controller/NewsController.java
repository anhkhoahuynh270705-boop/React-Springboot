package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.News;
import com.example.demo.service.NewsService;
import com.example.demo.util.ResponseUtils;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    @GetMapping
    public Map<String, Object> getAllNews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) String search) {

        Map<String, Object> result = ResponseUtils.success(null);
        result.putAll(newsService.getAllNews(page, size, category, featured, search));

        return result;
    }

    @GetMapping("/{id}")
    public Map<String, Object> getNewsById(@PathVariable String id) {
        News news = newsService.getNewsById(id);
        return ResponseUtils.success(null, "news", news);
    }

    @GetMapping("/featured")
    public Map<String, Object> getFeaturedNews() {
        List<News> news = newsService.getFeaturedNews();
        return ResponseUtils.data("news", news);
    }

    @GetMapping("/category/{category}")
    public Map<String, Object> getNewsByCategory(@PathVariable String category) {
        List<News> news = newsService.getNewsByCategory(category);
        return ResponseUtils.data("news", news);
    }

    @GetMapping("/search")
    public Map<String, Object> searchNews(@RequestParam String q) {
        List<News> news = newsService.searchNews(q);

        Map<String, Object> response = ResponseUtils.data("news", news);
        response.put("query", q);

        return response;
    }

    @GetMapping("/categories")
    public Map<String, Object> getNewsCategories() {
        List<String> categories = newsService.getNewsCategories();
        return ResponseUtils.data("categories", categories);
    }

    @GetMapping("/popular")
    public Map<String, Object> getPopularNews() {
        List<News> news = newsService.getPopularNews();
        return ResponseUtils.data("news", news);
    }

    @GetMapping("/recent")
    public Map<String, Object> getRecentNews() {
        List<News> news = newsService.getRecentNews();
        return ResponseUtils.data("news", news);
    }

    @PostMapping
    public Map<String, Object> createNews(@RequestBody News news) {
        News savedNews = newsService.createNews(news);
        return ResponseUtils.success("Create news successfully", "news", savedNews);
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateNews(
            @PathVariable String id,
            @RequestBody News newsDetails) {

        News updatedNews = newsService.updateNews(id, newsDetails);
        return ResponseUtils.success("Update news successfully", "news", updatedNews);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteNews(@PathVariable String id) {
        newsService.deleteNews(id);
        return ResponseUtils.success("Delete news successfully");
    }
}