package com.example.demo.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public final class DateUtils {

    private DateUtils() {}
    public static String nowIso() {
        return LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }

    public static LocalDateTime parseBookingTime(String bookingTime) {
        if (bookingTime == null || bookingTime.isBlank()) {
            return null;
        }

        String raw = bookingTime.trim().replace("Z", "");
        if (raw.length() > 19) {
            raw = raw.substring(0, 19);
        }

        try {
            return LocalDateTime.parse(raw, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (DateTimeParseException e) {
            try {
                return LocalDateTime.parse(bookingTime, DateTimeFormatter.ISO_DATE_TIME);
            } catch (DateTimeParseException e2) {
                return null;
            }
        }
    }
}
