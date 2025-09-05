package com.example.demo.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.example.demo.model.Article;

public interface ArticleRepository extends MongoRepository<Article, String> {
    
    // Find articles by movie ID
    List<Article> findByMovieId(String movieId);
    
    // Find articles by movie ID with pagination
    Page<Article> findByMovieId(String movieId, Pageable pageable);
    
    // Find articles by multiple movie IDs
    List<Article> findByMovieIdsContaining(String movieId);
    
    // Find articles by category
    List<Article> findByCategory(String category);
    
    // Find articles by category with pagination
    Page<Article> findByCategory(String category, Pageable pageable);
    
    // Find articles by author
    List<Article> findByAuthor(String author);
    
    // Find articles by status
    List<Article> findByStatus(String status);
    
    // Find active articles
    List<Article> findByIsActiveTrue();
    
    // Find featured articles
    List<Article> findByIsFeaturedTrue();
    
    // Find published articles
    List<Article> findByStatusAndIsActiveTrue(String status);
    
    // Search articles by title (case insensitive)
    List<Article> findByTitleContainingIgnoreCase(String title);
    
    // Search articles by content (case insensitive)
    List<Article> findByContentContainingIgnoreCase(String content);
    
    // Search articles by title or content (case insensitive)
    @Query("{'$or': [{'title': {'$regex': '?0', '$options': 'i'}}, {'content': {'$regex': '?0', '$options': 'i'}}, {'excerpt': {'$regex': '?0', '$options': 'i'}}]}")
    List<Article> findByTitleOrContentContainingIgnoreCase(String searchTerm);
    
    // Find articles by tags
    List<Article> findByTagsContaining(String tag);
    
    // Find latest articles (ordered by publishedAt desc)
    List<Article> findByStatusAndIsActiveTrueOrderByPublishedAtDesc(String status, Pageable pageable);
    
    // Find articles by movie ID and status
    List<Article> findByMovieIdAndStatusAndIsActiveTrue(String movieId, String status);
    
    // Find articles by category and status
    List<Article> findByCategoryAndStatusAndIsActiveTrue(String category, String status);
    
    // Count articles by movie ID
    long countByMovieId(String movieId);
    
    // Count articles by category
    long countByCategory(String category);
    
    // Count articles by author
    long countByAuthor(String author);
}
