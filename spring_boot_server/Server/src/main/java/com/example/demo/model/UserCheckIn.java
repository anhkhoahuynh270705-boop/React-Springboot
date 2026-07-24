package com.example.demo.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_checkins")
@CompoundIndex(name = "user_date_idx", def = "{'userId': 1, 'checkInDate': 1}", unique = true)
public class UserCheckIn {

    @Id
    private String id;

    private String userId;

    // Lưu theo ngày (YYYY-MM-DD), không lưu giờ để dễ so sánh
    private LocalDate checkInDate;

    private int coinsEarned;

    private LocalDateTime createdAt;
}
