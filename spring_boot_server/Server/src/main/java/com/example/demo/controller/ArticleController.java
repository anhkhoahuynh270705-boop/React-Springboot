package com.example.demo.controller;

import java.util.List;

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
import com.example.demo.service.ArticleService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/articles")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    // Get all articles
    @GetMapping
    public ResponseEntity<List<Article>> getAllArticles(
            @RequestParam(defaultValue = "published") String status,
            @RequestParam(defaultValue = "true") Boolean isActive) {

        List<Article> articles = articleService.getAllArticles(status, isActive);
        return ResponseEntity.ok(articles);
    }

    // Get article by ID
    @GetMapping("/{id}")
    public ResponseEntity<Article> getArticleById(@PathVariable String id) {
        Article article = articleService.getArticleById(id);
        return ResponseEntity.ok(article);
    }

    // Get articles by movie ID
    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<Article>> getArticlesByMovieId(@PathVariable String movieId) {
        List<Article> articles = articleService.getArticlesByMovieId(movieId);
        return ResponseEntity.ok(articles);
    }

    // Search articles by title or content
    @GetMapping("/search")
    public ResponseEntity<List<Article>> searchArticles(@RequestParam String title) {
        List<Article> articles = articleService.searchArticles(title);
        return ResponseEntity.ok(articles);
    }

    // Get articles by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Article>> getArticlesByCategory(@PathVariable String category) {
        List<Article> articles = articleService.getArticlesByCategory(category);
        return ResponseEntity.ok(articles);
    }

    // Get featured articles
    @GetMapping("/featured")
    public ResponseEntity<List<Article>> getFeaturedArticles() {
        List<Article> articles = articleService.getFeaturedArticles();
        return ResponseEntity.ok(articles);
    }

    // Get articles by author
    @GetMapping("/author/{author}")
    public ResponseEntity<List<Article>> getArticlesByAuthor(@PathVariable String author) {
        List<Article> articles = articleService.getArticlesByAuthor(author);
        return ResponseEntity.ok(articles);
    }

    // Get article count by movie ID
    @GetMapping("/count/movie/{movieId}")
    public ResponseEntity<Long> getArticleCountByMovieId(@PathVariable String movieId) {
        long count = articleService.getArticleCountByMovieId(movieId);
        return ResponseEntity.ok(count);
    }

    // Get article count by category
    @GetMapping("/count/category/{category}")
    public ResponseEntity<Long> getArticleCountByCategory(@PathVariable String category) {
        long count = articleService.getArticleCountByCategory(category);
        return ResponseEntity.ok(count);
    }

    // Create a new article
    @PostMapping
    public ResponseEntity<Article> createArticle(@RequestBody Article article) {
        Article savedArticle = articleService.createArticle(article);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedArticle);
    }

    // Update an existing article
    @PutMapping("/{id}")
    public ResponseEntity<Article> updateArticle(
            @PathVariable String id,
            @RequestBody Article article) {

        Article updatedArticle = articleService.updateArticle(id, article);
        return ResponseEntity.ok(updatedArticle);
    }

    // Delete an article
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArticle(@PathVariable String id) {
        articleService.deleteArticle(id);
        return ResponseEntity.noContent().build();
    }
}