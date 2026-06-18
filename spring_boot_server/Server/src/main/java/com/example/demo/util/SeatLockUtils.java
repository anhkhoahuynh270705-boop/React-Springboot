package com.example.demo.util;

public final class SeatLockUtils {

    private SeatLockUtils() {}

    private static final String KEY_PREFIX = "seat_lock:";

    public static String lockKey(String showtimeId, String seatId) {
        return KEY_PREFIX + showtimeId + ":" + seatId;
    }
}
