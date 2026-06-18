package com.example.demo.model;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "articles")
public class Article {
    @Id
    private String id;
    private String title;
    private String content;
    private String excerpt;
    private String summary;
    private String description;
    private String author;
    private String source;
    private String category;
    private String image;
    private String imageUrl;
    private String url;
    private String href;
    private String movieId;
    private List<String> movieIds; 
    private List<String> tags;
    private String status; 
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer viewCount;
    private Integer likeCount;
    private Integer shareCount;
    private Boolean isFeatured;
    private Boolean isActive;
    
    // SEO fields
    private String metaTitle;
    private String metaDescription;
    private String slug;
    private String videoUrl;
    private String audioUrl;
    private List<String> galleryImages;
    private String readingTime;
}
