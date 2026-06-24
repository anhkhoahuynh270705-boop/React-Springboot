package com.example.demo.service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ConflictException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Seat;
import com.example.demo.repository.SeatRepository;
import com.example.demo.util.SeatLockUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SeatLockService {

    private final StringRedisTemplate redisTemplate;
    private final SeatRepository seatRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private static final Duration LOCK_TTL = Duration.ofMinutes(10);

    public void lockSeats(String showtimeId, List<String> seatIds, String userId) {
        if (showtimeId == null || seatIds == null || seatIds.isEmpty() || userId == null) {
            throw new BadRequestException("Missing lock information");
        }

        List<String> lockedKeys = new ArrayList<>();

        for (String seatId : seatIds) {
            Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new ResourceNotFoundException("Seat", "id", seatId));

            if (seat.isBooked()) {
                throw new ConflictException("Seat " + seat.getSeatNumber() + " is already booked");
            }

            if (!showtimeId.equals(seat.getShowtimeId())) {
                throw new BadRequestException("Seat " + seat.getSeatNumber() + " does not belong to this showtime");
            }

            String key = SeatLockUtils.lockKey(showtimeId, seatId);
            String currentOwner = redisTemplate.opsForValue().get(key);

            if (currentOwner != null) {
                if (currentOwner.equals(userId)) {
                    // Refresh TTL if the same user re-locks
                    redisTemplate.expire(key, LOCK_TTL);
                    continue;
                }

                releaseLockedKeys(lockedKeys);
                throw new ConflictException("Seat " + seat.getSeatNumber() + " is being held by another user");
            }

            Boolean success = redisTemplate.opsForValue().setIfAbsent(key, userId, LOCK_TTL);

            if (!Boolean.TRUE.equals(success)) {
                releaseLockedKeys(lockedKeys);
                throw new ConflictException("Cannot lock seat: " + seat.getSeatNumber());
            }

            lockedKeys.add(key);
        }

        // Broadcast seat lock update to all clients watching this showtime
        broadcastSeatUpdate(showtimeId, seatIds, userId, "LOCKED");
    }

    public void releaseSeats(String showtimeId, List<String> seatIds, String userId) {
        if (showtimeId == null || seatIds == null || userId == null) return;

        for (String seatId : seatIds) {
            String key = SeatLockUtils.lockKey(showtimeId, seatId);
            String owner = redisTemplate.opsForValue().get(key);

            if (userId.equals(owner)) {
                redisTemplate.delete(key);
            }
        }

        // Broadcast seat release update to all clients watching this showtime
        broadcastSeatUpdate(showtimeId, seatIds, userId, "RELEASED");
    }

    public boolean isLockedByOtherUser(String showtimeId, String seatId, String userId) {
        String owner = redisTemplate.opsForValue().get(SeatLockUtils.lockKey(showtimeId, seatId));
        return owner != null && !owner.equals(userId);
    }

    public boolean isLockedByUser(String showtimeId, String seatId, String userId) {
        String owner = redisTemplate.opsForValue().get(SeatLockUtils.lockKey(showtimeId, seatId));
        return userId != null && userId.equals(owner);
    }

    public void validateSeatsLockedByUser(String showtimeId, List<String> seatIds, String userId) {
        for (String seatId : seatIds) {
            String key = SeatLockUtils.lockKey(showtimeId, seatId);
            String owner = redisTemplate.opsForValue().get(key);

            System.out.println("[SeatLock] Validating lock for seat: " + seatId + ", user: " + userId + ", owner in Redis: " + owner);
            if (!userId.equals(owner)) {
                throw new BadRequestException("Seat lock expired or not owned by user");
            }
        }
    }

    public void confirmAndReleaseLocks(String showtimeId, List<String> seatIds, String userId) {
        validateSeatsLockedByUser(showtimeId, seatIds, userId);
        releaseSeats(showtimeId, seatIds, userId);
    }

    private void releaseLockedKeys(List<String> keys) {
        keys.forEach(redisTemplate::delete);
    }

    // Broadcast websocket to all clients watching this showtime
    private void broadcastSeatUpdate(String showtimeId, List<String> seatIds, String userId, String action) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("showtimeId", showtimeId);
            payload.put("seatIds", seatIds);
            payload.put("lockedBy", userId);
            payload.put("action", action); // "LOCKED" or "RELEASED"
            messagingTemplate.convertAndSend("/topic/seats/" + showtimeId, payload);
        } catch (Exception e) {
            System.err.println("[WebSocket] Failed to broadcast seat update: " + e.getMessage());
        }
    }
}