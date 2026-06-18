package com.example.demo.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.demo.model.News;

@Repository
public interface NewsRepository extends MongoRepository<News, String> {

    List<News> findAllByOrderByPublishDateDesc();
    List<News> findByFeaturedTrueOrderByPublishDateDesc();
    List<News> findByCategoryOrderByPublishDateDesc(String category);
    List<News> findByCategoryAndFeaturedOrderByPublishDateDesc(String category, Boolean featured);
    
    @Query("{ $or: [ " +
           "{ 'title': { $regex: ?0, $options: 'i' } }, " +
           "{ 'summary': { $regex: ?0, $options: 'i' } }, " +
           "{ 'tags': { $regex: ?0, $options: 'i' } } " +
           "] }")

    List<News> searchNews(String query);

    @Query("{ 'category': { $in: ?0 } }")
    List<News> findByCategoryInOrderByPublishDateDesc(List<String> categories);

    List<News> findTop10ByOrderByViewsDesc();

    @Query("{ 'publishDate': { $gte: ?0 } }")
    List<News> findRecentNews(LocalDateTime date);
 
    long countByCategory(String category);
    long countByFeaturedTrue();

    List<News> findByAuthorOrderByPublishDateDesc(String author);
    List<News> findByViewsGreaterThanEqualOrderByViewsDesc(Integer minViews);
    List<News> findByTitleContainingIgnoreCaseOrderByPublishDateDesc(String title);
    List<News> findBySummaryContainingIgnoreCaseOrderByPublishDateDesc(String summary);

    @Query("{ 'featured': ?0, 'category': ?1 }")
    List<News> findByFeaturedAndCategoryOrderByPublishDateDesc(Boolean featured, String category);

    @Query("{ 'publishDate': { $gte: ?0, $lte: ?1 } }")
    List<News> findByPublishDateBetweenOrderByPublishDateDesc(LocalDateTime startDate, LocalDateTime endDate);

    @Query("{ 'author': ?0, 'category': ?1 }")
    List<News> findByAuthorAndCategoryOrderByPublishDateDesc(String author, String category);
}
