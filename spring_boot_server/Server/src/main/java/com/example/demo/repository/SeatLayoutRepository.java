package com.example.demo.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.demo.model.SeatLayout;

public interface SeatLayoutRepository extends MongoRepository<SeatLayout, String> {
}