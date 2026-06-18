package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Cinema;

@Repository
public interface CinemaRepository extends MongoRepository<Cinema, String> {

    List<Cinema> findByNameContainingIgnoreCase(String name);
    List<Cinema> findByCity(String city);
    List<Cinema> findByStatus(String status);
    List<Cinema> findByMovieIdsContaining(String movieId);
    List<Cinema> findByNameContainingIgnoreCaseAndCity(String name, String city);
    List<Cinema> findByStatusOrderByNameAsc(String status);

    Optional<Cinema> findByName(String name);
}