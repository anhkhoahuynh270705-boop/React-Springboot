package com.example.demo.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
@Document(collection = "showtimes")
public class Showtime {
    @Id
    private String id;
    @Indexed
    private String movieId;
    private String movieName; 

    @Indexed
    private String cinemaId; 
    private String cinemaName;
    private String cinemaAddress;
    
    //layout
    private String layoutId;
    private String layoutName;
    private String totalRows;
    private String totalCols;
    
    @Indexed
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startTime;
    
    private String room;
    private int totalSeats;
    private int availableSeats;
    private double price;
    private String format; 

    public String getShowDate() {
        if (startTime != null) {
            return startTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        }
        return null;
    }
    
    public String getShowTime() {
        if (startTime != null) {
            return startTime.format(DateTimeFormatter.ofPattern("HH:mm"));
        }
        return null;
    }
    
    public String getMovieTitle() {
        return movieName;
    }
}
