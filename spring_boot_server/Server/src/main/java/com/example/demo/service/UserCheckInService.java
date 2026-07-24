package com.example.demo.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.demo.exception.ConflictException;
import com.example.demo.model.UserCheckIn;
import com.example.demo.repository.UserCheckInRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserCheckInService {

    private static final int CHECKIN_COINS = 10;

    private final UserCheckInRepository checkInRepository;

    public boolean hasCheckedInToday(String userId) {
        return checkInRepository.existsByUserIdAndCheckInDate(userId, LocalDate.now());
    }

    public Map<String, Object> checkInToday(String userId) {
        LocalDate today = LocalDate.now();

        if (checkInRepository.existsByUserIdAndCheckInDate(userId, today)) {
            throw new ConflictException("You have already checked in today.");
        }

        UserCheckIn checkIn = new UserCheckIn();
        checkIn.setUserId(userId);
        checkIn.setCheckInDate(today);
        checkIn.setCoinsEarned(CHECKIN_COINS);
        checkIn.setCreatedAt(LocalDateTime.now());

        checkInRepository.save(checkIn);

        return Map.of(
                "success", true,
                "coinsEarned", CHECKIN_COINS,
                "checkInDate", today.toString());
    }

    /**
     * Lấy toàn bộ lịch sử check-in của user (mới nhất trước).
     */
    public List<UserCheckIn> getCheckInHistory(String userId) {
        return checkInRepository.findByUserIdOrderByCheckInDateDesc(userId);
    }
}
