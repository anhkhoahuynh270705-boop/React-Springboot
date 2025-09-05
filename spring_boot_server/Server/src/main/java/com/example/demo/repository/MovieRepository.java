package com.example.demo.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.demo.model.Movie;

public interface MovieRepository extends MongoRepository<Movie, String> {
}
