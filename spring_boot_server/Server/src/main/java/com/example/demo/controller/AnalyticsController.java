package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import com.example.demo.service.AnalyticsService;
import com.example.demo.model.Ticket;
import com.example.demo.model.Movie;
import com.example.demo.model.Cinema;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboard() {
        return analyticsService.getDashboard();
    }

    @GetMapping("/revenue-by-movie")
    public List<Map<String, Object>> getRevenueByMovie() {
        return analyticsService.getRevenueByMovie();
    }

    @GetMapping("/tickets")
    public List<Ticket> getAllTickets() {
        return analyticsService.getAllTickets();
    }

    @GetMapping("/users")
    public List<Map<String, Object>> getAllUsersForAnalytics() {
        return analyticsService.getAllUsersForAnalytics();
    }

    @GetMapping("/movies")
    public List<Movie> getAllMovies() {
        return analyticsService.getAllMovies();
    }

    @GetMapping("/cinemas")
    public List<Cinema> getAllCinemas() {
        return analyticsService.getAllCinemas();
    }
}
