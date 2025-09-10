package com.example.demo.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
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

import com.example.demo.model.Article;
import com.example.demo.repository.ArticleRepository;

@RestController
@RequestMapping("/api/articles")
@CrossOrigin(origins = "*")
public class ArticleController {

    @Autowired
    private ArticleRepository articleRepository;

    @GetMapping
    public ResponseEntity<List<Article>> getAllArticles(
            @RequestParam(defaultValue = "published") String status,
            @RequestParam(defaultValue = "true") Boolean isActive) {
        try {
            List<Article> articles;
            if (isActive) {
                articles = articleRepository.findByStatusAndIsActiveTrue(status);
            } else {
                articles = articleRepository.findByStatus(status);
            }
            return ResponseEntity.ok(articles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Article> getArticleById(@PathVariable String id) {
        try {
            Optional<Article> article = articleRepository.findById(id);
            if (article.isPresent()) {
                return ResponseEntity.ok(article.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<Article>> getArticlesByMovieId(@PathVariable String movieId) {
        try {
            List<Article> articles = articleRepository.findByMovieIdAndStatusAndIsActiveTrue(movieId, "published");
            return ResponseEntity.ok(articles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Article>> searchArticles(@RequestParam String title) {
        try {
            List<Article> articles = articleRepository.findByTitleOrContentContainingIgnoreCase(title);
            return ResponseEntity.ok(articles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Article>> getArticlesByCategory(@PathVariable String category) {
        try {
            List<Article> articles = articleRepository.findByCategoryAndStatusAndIsActiveTrue(category, "published");
            return ResponseEntity.ok(articles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<List<Article>> getLatestArticles(@RequestParam(defaultValue = "10") int limit) {
        try {
            Pageable pageable = PageRequest.of(0, limit);
            List<Article> articles = articleRepository.findByStatusAndIsActiveTrueOrderByPublishedAtDesc("published", pageable);
            return ResponseEntity.ok(articles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Article>> getFeaturedArticles() {
        try {
            List<Article> articles = articleRepository.findByIsFeaturedTrue();
            return ResponseEntity.ok(articles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/author/{author}")
    public ResponseEntity<List<Article>> getArticlesByAuthor(@PathVariable String author) {
        try {
            List<Article> articles = articleRepository.findByAuthor(author);
            return ResponseEntity.ok(articles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<Article> createArticle(@RequestBody Article article) {
        try {
            if (article.getTitle() == null || article.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (article.getContent() == null || article.getContent().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
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

            // Set timestamps
            LocalDateTime now = LocalDateTime.now();
            article.setCreatedAt(now);
            article.setUpdatedAt(now);
            if (article.getStatus().equals("published") && article.getPublishedAt() == null) {
                article.setPublishedAt(now);
            }

            Article savedArticle = articleRepository.save(article);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedArticle);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Article> updateArticle(@PathVariable String id, @RequestBody Article article) {
        try {
            if (!articleRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            if (article.getTitle() == null || article.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (article.getContent() == null || article.getContent().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            article.setId(id);
            article.setUpdatedAt(LocalDateTime.now());

            if (article.getStatus() != null && article.getStatus().equals("published")) {
                Optional<Article> existingArticle = articleRepository.findById(id);
                if (existingArticle.isPresent() && !"published".equals(existingArticle.get().getStatus())) {
                    article.setPublishedAt(LocalDateTime.now());
                }
            }

            Article updatedArticle = articleRepository.save(article);
            return ResponseEntity.ok(updatedArticle);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArticle(@PathVariable String id) {
        try {
            if (!articleRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            articleRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/count/movie/{movieId}")
    public ResponseEntity<Long> getArticleCountByMovieId(@PathVariable String movieId) {
        try {
            long count = articleRepository.countByMovieId(movieId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/count/category/{category}")
    public ResponseEntity<Long> getArticleCountByCategory(@PathVariable String category) {
        try {
            long count = articleRepository.countByCategory(category);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
