package com.example.demo.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
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
import com.example.demo.repository.NewsRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NewsController {

    private final NewsRepository newsRepository;
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllNews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) String search) {
        
        try {
            List<News> news;
            long totalElements;
            
            if (search != null && !search.trim().isEmpty()) {
                news = newsRepository.searchNews(search.trim());
                totalElements = news.size();
            } else if (category != null && !category.trim().isEmpty()) {
                if (featured != null) {
                    news = newsRepository.findByCategoryAndFeaturedOrderByPublishDateDesc(category, featured);
                } else {
                    news = newsRepository.findByCategoryOrderByPublishDateDesc(category);
                }
                totalElements = news.size();
            } else if (featured != null) {
                news = newsRepository.findByFeaturedTrueOrderByPublishDateDesc();
                totalElements = news.size();
            } else {
                @SuppressWarnings("unused")
                Pageable pageable = PageRequest.of(page, size);
                news = newsRepository.findAllByOrderByPublishDateDesc();
                totalElements = news.size();
                
                int start = page * size;
                int end = Math.min(start + size, news.size());
                if (start < news.size()) {
                    news = news.subList(start, end);
                } else {
                    news = List.of();
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("news", news);
            response.put("totalElements", totalElements);
            response.put("totalPages", (int) Math.ceil((double) totalElements / size));
            response.put("currentPage", page);
            response.put("size", size);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy danh sách tin tức: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Get news by ID
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getNewsById(@PathVariable String id) {
        try {
            Optional<News> news = newsRepository.findById(id);
            if (news.isPresent()) {
                News newsItem = news.get();
                newsItem.incrementViews();
                newsRepository.save(newsItem);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("news", newsItem);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Không tìm thấy tin tức");
                return ResponseEntity.status(404).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy tin tức: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Get featured news
    @GetMapping("/featured")
    public ResponseEntity<Map<String, Object>> getFeaturedNews() {
        try {
            List<News> featuredNews = newsRepository.findByFeaturedTrueOrderByPublishDateDesc();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("news", featuredNews);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy tin tức nổi bật: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Get news by category
    @GetMapping("/category/{category}")
    public ResponseEntity<Map<String, Object>> getNewsByCategory(@PathVariable String category) {
        try {
            List<News> news = newsRepository.findByCategoryOrderByPublishDateDesc(category);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("news", news);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy tin tức theo danh mục: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Search news
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchNews(@RequestParam String q) {
        try {
            List<News> news = newsRepository.searchNews(q);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("news", news);
            response.put("query", q);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi tìm kiếm tin tức: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Get news categories
    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> getNewsCategories() {
        try {
            List<String> categories = newsRepository.findAll()
                .stream()
                .map(News::getCategory)
                .distinct()
                .sorted()
                .toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("categories", categories);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy danh mục tin tức: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Get most viewed news
    @GetMapping("/popular")
    public ResponseEntity<Map<String, Object>> getPopularNews() {
        try {
            List<News> popularNews = newsRepository.findTop10ByOrderByViewsDesc();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("news", popularNews);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy tin tức phổ biến: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Get recent news 
    @GetMapping("/recent")
    public ResponseEntity<Map<String, Object>> getRecentNews() {
        try {
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            List<News> recentNews = newsRepository.findRecentNews(thirtyDaysAgo);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("news", recentNews);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy tin tức gần đây: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Create new 
    @PostMapping
    public ResponseEntity<Map<String, Object>> createNews(@RequestBody News news) {
        try {
            news.setDefaultValues();
            if (news.getPublishDate() == null) {
                news.setPublishDate(LocalDateTime.now());
            }
            
            News savedNews = newsRepository.save(news);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tạo tin tức thành công");
            response.put("news", savedNews);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi tạo tin tức: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Update news (Admin only)
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateNews(@PathVariable String id, @RequestBody News newsDetails) {
        try {
            Optional<News> newsOptional = newsRepository.findById(id);
            if (newsOptional.isPresent()) {
                News news = newsOptional.get();
                news.setTitle(newsDetails.getTitle());
                news.setSummary(newsDetails.getSummary());
                news.setContent(newsDetails.getContent());
                news.setAuthor(newsDetails.getAuthor());
                news.setCategory(newsDetails.getCategory());
                news.setTags(newsDetails.getTags());
                news.setImageUrl(newsDetails.getImageUrl());
                news.setFeatured(newsDetails.getFeatured());
                news.updateTimestamp();
                
                News updatedNews = newsRepository.save(news);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Cập nhật tin tức thành công");
                response.put("news", updatedNews);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Không tìm thấy tin tức");
                return ResponseEntity.status(404).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi cập nhật tin tức: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Delete news (Admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteNews(@PathVariable String id) {
        try {
            if (newsRepository.existsById(id)) {
                newsRepository.deleteById(id);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Xóa tin tức thành công");
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Không tìm thấy tin tức");
                return ResponseEntity.status(404).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi xóa tin tức: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
