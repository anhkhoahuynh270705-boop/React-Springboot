package com.example.demo.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.example.demo.model.Showtime;

public interface ShowtimeRepository extends MongoRepository<Showtime, String> {
    
    List<Showtime> findByMovieId(String movieId);
    @Query("{'movieId': ?0}")
    List<Showtime> findShowtimesByMovieId(String movieId);
}
