package com.example.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "movies")
public class Movie {
    @Id
    private String id;
    private String title;
    private String description;
    private String genre;
    private String director;
    private String actors;
    private int duration; 
    private String imageUrl;
    private String englishTitle; 
    private String[] genres; 
    private String posterUrl; 
    private String poster; 
    private String image; 
    private String rating; 
    private String score; 
    private String voteAverage; 
    private String imdbRating; 
    private String format; 
    private String releaseDate; 
    private String releaseYear; 
    private String year; 
    private String ageRating; 
    private String ageLimit; 
    private String certification; 
    private String[] cast;
    private String starring;
    private String trailerUrl; 
    private String overview;
    private String summary; 
    private String synopsis; 
    private String runtime; 
    private String length;
    private String name;
    private String movieName; 
    private String category;
}
