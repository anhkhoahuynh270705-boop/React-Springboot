package com.example.demo.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.demo.model.Seat;

public interface SeatRepository extends MongoRepository<Seat, String> {
    List<Seat> findByShowtimeId(String showtimeId);
    void deleteByShowtimeId(String showtimeId);
}