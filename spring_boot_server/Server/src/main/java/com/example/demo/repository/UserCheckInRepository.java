package com.example.demo.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.demo.model.UserCheckIn;

public interface UserCheckInRepository extends MongoRepository<UserCheckIn, String> {

    boolean existsByUserIdAndCheckInDate(String userId, LocalDate checkInDate);

    List<UserCheckIn> findByUserIdOrderByCheckInDateDesc(String userId);
}
