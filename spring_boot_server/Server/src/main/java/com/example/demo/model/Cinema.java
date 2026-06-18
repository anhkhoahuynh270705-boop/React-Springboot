package com.example.demo.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;

@Data
@Document(collection = "cinemas")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Cinema {
    @Id
    private String id;
    private String name;
    private String address;
    private String city;
    private String phone;
    private String email;
    private String description;
    private List<String> facilities; 
    private String imageUrl;
    private String status; 
    private int totalRooms;
    private int totalSeats;
    private List<String> movieIds; 
    private String openingHours; 
    private String website;
    private String socialMedia;
    
    // Constructor
    public Cinema() {
        this.facilities = new ArrayList<>();
        this.movieIds = new ArrayList<>();
        this.status = "Bán vé";
    }

    public void addMovie(String movieId) {
        if (movieIds == null) {
            movieIds = new ArrayList<>();
        }
        if (!movieIds.contains(movieId)) {
            movieIds.add(movieId);
        }
    }
    
    public void removeMovie(String movieId) {
        if (movieIds != null) {
            movieIds.remove(movieId);
        }
    }
    
    public boolean hasMovie(String movieId) {
        return movieIds != null && movieIds.contains(movieId);
    }
}