package com.example.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "news")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class News {
    @Id
    private String id;

    private String title;
    private String summary;
    private String content;
    private String author;
    private LocalDateTime publishDate;
    private String category;
    private List<String> tags;
    private String imageUrl;
    private Boolean featured = false;
    private Integer views = 0;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


    public News(String title, String summary, String content, String author, 
                String category, List<String> tags, String imageUrl, Boolean featured) {
        this.title = title;
        this.summary = summary;
        this.content = content;
        this.author = author;
        this.category = category;
        this.tags = tags;
        this.imageUrl = imageUrl;
        this.featured = featured;
        this.createdAt = LocalDateTime.now();
        this.views = 0;
    }

    public void incrementViews() {
        this.views++;
    }
    public void setDefaultValues() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.views == null) {
            this.views = 0;
        }
        if (this.featured == null) {
            this.featured = false;
        }
    }

    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }
}
