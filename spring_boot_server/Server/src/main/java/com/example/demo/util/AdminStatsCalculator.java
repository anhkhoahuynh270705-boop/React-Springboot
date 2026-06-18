package com.example.demo.util;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import com.example.demo.model.Ticket;
import com.example.demo.model.User;

public final class AdminStatsCalculator {

    private AdminStatsCalculator() {}

    public static boolean countsTowardRevenue(Ticket ticket) {
        if (ticket == null) {
            return false;
        }
        String status = ticket.getStatus();
        if (status == null || "cancelled".equalsIgnoreCase(status)) {
            return false;
        }
        if ("confirmed".equalsIgnoreCase(status) || "used".equalsIgnoreCase(status)) {
            return true;
        }
        return "pending".equalsIgnoreCase(status)
                && "paid".equalsIgnoreCase(ticket.getPaymentStatus());
    }

    public static Map<String, Double> buildMonthlyRevenue(List<Ticket> tickets) {
        Map<String, Double> monthlyRevenue = new LinkedHashMap<>();
        YearMonth current = YearMonth.now();

        for (int i = 5; i >= 0; i--) {
            YearMonth ym = current.minusMonths(i);
            String label = ym.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            final YearMonth bucket = ym;

            double sum = tickets.stream()
                    .filter(AdminStatsCalculator::countsTowardRevenue)
                    .filter(t -> {
                        LocalDateTime booked = DateUtils.parseBookingTime(t.getBookingTime());
                        return booked != null && YearMonth.from(booked).equals(bucket);
                    })
                    .mapToDouble(Ticket::getPrice)
                    .sum();

            monthlyRevenue.put(label, sum);
        }
        return monthlyRevenue;
    }

    public static Map<String, Integer> buildWeeklyTicketSales(List<Ticket> tickets) {
        Map<String, Integer> sales = new LinkedHashMap<>();
        for (DayOfWeek d : DayOfWeek.values()) {
            sales.put(dayOfWeekLabel(d), 0);
        }

        tickets.stream()
                .filter(AdminStatsCalculator::countsTowardRevenue)
                .forEach(t -> {
                    LocalDateTime booked = DateUtils.parseBookingTime(t.getBookingTime());
                    if (booked != null) {
                        String label = dayOfWeekLabel(booked.getDayOfWeek());
                        sales.merge(label, 1, Integer::sum);
                    }
                });

        return sales;
    }

    public static Map<String, Integer> buildWeeklyUserGrowth(List<User> users) {
        Map<String, Integer> growth = new LinkedHashMap<>();
        growth.put("Week 1", 0);
        growth.put("Week 2", 0);
        growth.put("Week 3", 0);
        growth.put("Week 4", 0);

        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);

        users.forEach(user -> {
            LocalDateTime created = user.getCreatedAt();
            if (created == null) {
                return;
            }
            LocalDate createdDate = created.toLocalDate();
            if (createdDate.getYear() != monthStart.getYear()
                    || createdDate.getMonthValue() != monthStart.getMonthValue()) {
                return;
            }
            int weekIndex = Math.min(3, (createdDate.getDayOfMonth() - 1) / 7);
            String weekKey = "Week " + (weekIndex + 1);
            growth.merge(weekKey, 1, Integer::sum);
        });

        return growth;
    }

    public static Map<String, Object> buildPopularMovies(List<Ticket> tickets) {
        Map<String, Long> countByMovie = tickets.stream()
                .filter(AdminStatsCalculator::countsTowardRevenue)
                .collect(Collectors.groupingBy(
                        t -> {
                            String title = t.getMovieTitle();
                            if (title != null && !title.isBlank()) {
                                return title;
                            }
                            return t.getMovieId() != null ? t.getMovieId() : "Unknown";
                        },
                        Collectors.counting()));

        List<Map.Entry<String, Long>> top = countByMovie.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
                .limit(3)
                .collect(Collectors.toList());

        Map<String, Object> popularMovies = new LinkedHashMap<>();
        for (int i = 0; i < top.size(); i++) {
            popularMovies.put("movie" + (i + 1), top.get(i).getKey());
        }
        return popularMovies;
    }

    private static String dayOfWeekLabel(DayOfWeek day) {
        return switch (day) {
            case MONDAY -> "T2";
            case TUESDAY -> "T3";
            case WEDNESDAY -> "T4";
            case THURSDAY -> "T5";
            case FRIDAY -> "T6";
            case SATURDAY -> "T7";
            case SUNDAY -> "CN";
        };
    }
}
