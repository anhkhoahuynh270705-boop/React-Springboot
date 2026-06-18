package com.example.demo.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.example.demo.model.Article;

public interface ArticleRepository extends MongoRepository<Article, String> {

    Page<Article> findByMovieId(String movieId, Pageable pageable);
    Page<Article> findByCategory(String category, Pageable pageable);

    List<Article> findByMovieId(String movieId);
    List<Article> findByMovieIdsContaining(String movieId);
    List<Article> findByCategory(String category);
    List<Article> findByAuthor(String author);
    List<Article> findByStatus(String status);
    List<Article> findByIsActiveTrue();
    List<Article> findByIsFeaturedTrue();
    List<Article> findByStatusAndIsActiveTrue(String status);
    List<Article> findByTitleContainingIgnoreCase(String title);
    List<Article> findByContentContainingIgnoreCase(String content);
    
    @Query("{'$or': [{'title': {'$regex': '?0', '$options': 'i'}}, {'content': {'$regex': '?0', '$options': 'i'}}, {'excerpt': {'$regex': '?0', '$options': 'i'}}]}")
    List<Article> findByTitleOrContentContainingIgnoreCase(String searchTerm);
    
    List<Article> findByTagsContaining(String tag);
    List<Article> findByStatusAndIsActiveTrueOrderByPublishedAtDesc(String status, Pageable pageable);
    List<Article> findByMovieIdAndStatusAndIsActiveTrue(String movieId, String status);
    List<Article> findByCategoryAndStatusAndIsActiveTrue(String category, String status);

    long countByMovieId(String movieId);
    long countByCategory(String category);
    long countByAuthor(String author);
}
