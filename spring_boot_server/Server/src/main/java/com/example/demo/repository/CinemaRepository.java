package com.example.demo.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.demo.model.Cinema;

public interface CinemaRepository extends MongoRepository<Cinema, String> {
    List<Cinema> findByCity(String city);
    List<Cinema> findByNameContainingIgnoreCase(String name);
    List<Cinema> findByCityAndNameContainingIgnoreCase(String city, String name);
    List<Cinema> findByIsActiveTrue();
    List<Cinema> findByCityAndIsActiveTrue(String city);
}
