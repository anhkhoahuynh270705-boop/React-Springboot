package com.example.demo.service;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Article;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.util.ArticleUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;

    public List<Article> getAllArticles(String status, Boolean isActive) {
        if (Boolean.TRUE.equals(isActive)) {
            return articleRepository.findByStatusAndIsActiveTrue(status);
        }

        return articleRepository.findByStatus(status);
    }

    public Article getArticleById(String id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article", "id", id));
    }

    public List<Article> getArticlesByMovieId(String movieId) {
        return articleRepository.findByMovieIdAndStatusAndIsActiveTrue(movieId, "published");
    }

    public List<Article> searchArticles(String title) {
        if (title == null || title.trim().isEmpty()) {
            throw new BadRequestException("Search title is required");
        }

        return articleRepository.findByTitleOrContentContainingIgnoreCase(title);
    }

    public List<Article> getArticlesByCategory(String category) {
        return articleRepository.findByCategoryAndStatusAndIsActiveTrue(category, "published");
    }

    public List<Article> getFeaturedArticles() {
        return articleRepository.findByIsFeaturedTrue();
    }

    public List<Article> getArticlesByAuthor(String author) {
        return articleRepository.findByAuthor(author);
    }

    public long getArticleCountByMovieId(String movieId) {
        return articleRepository.countByMovieId(movieId);
    }

    public long getArticleCountByCategory(String category) {
        return articleRepository.countByCategory(category);
    }

    public Article createArticle(Article article) {
        ArticleUtils.validateRequiredFields(article);
        ArticleUtils.applyCreateDefaults(article);

        return articleRepository.save(article);
    }

    public Article updateArticle(String id, Article article) {
        ArticleUtils.validateRequiredFields(article);

        Article existingArticle = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article", "id", id));

        ArticleUtils.applyUpdateMetadata(existingArticle, article);

        return articleRepository.save(article);
    }

    public void deleteArticle(String id) {
        if (!articleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Article", "id", id);
        }

        articleRepository.deleteById(id);
    }
}