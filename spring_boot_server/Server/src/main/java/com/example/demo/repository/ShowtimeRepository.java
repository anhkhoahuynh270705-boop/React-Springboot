package com.example.demo.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.example.demo.model.Showtime;

public interface ShowtimeRepository extends MongoRepository<Showtime, String> {
    
    List<Showtime> findByMovieId(String movieId);
    
    @Query("{'movieId': ?0}")
    List<Showtime> findShowtimesByMovieId(String movieId);
    List<Showtime> findByCinemaId(String cinemaId);
    List<Showtime> findByCinemaIdAndMovieId(String cinemaId, String movieId);
    List<Showtime> findByCinemaNameContainingIgnoreCase(String cinemaName);

    @Query("{'cinemaId': ?0, 'startTime': {$gte: ?1, $lt: ?2}}")
    List<Showtime> findByCinemaIdAndDateRange(String cinemaId, String startDate, String endDate);
}
