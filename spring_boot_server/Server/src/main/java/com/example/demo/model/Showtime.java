package com.example.demo.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "showtimes")
public class Showtime {
    @Id
    private String id;
    private String movieId;
    private LocalDateTime startTime;
    private String room;
}
