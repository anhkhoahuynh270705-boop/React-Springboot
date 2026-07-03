package com.example.demo.service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.List;
import org.springframework.stereotype.Service;

import com.example.demo.repository.TicketRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.MovieRepository;
import com.example.demo.repository.CinemaRepository;
import com.example.demo.model.Ticket;
import com.example.demo.model.User;
import com.example.demo.model.Movie;
import com.example.demo.model.Cinema;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;
    private final CinemaRepository cinemaRepository;

    // Retrieve all tickets raw data
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    // Retrieve all movies
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    // Retrieve all cinemas
    public List<Cinema> getAllCinemas() {
        return cinemaRepository.findAll();
    }

    // Retrieve and sanitize user data for analytics
    public List<Map<String, Object>> getAllUsersForAnalytics() {
        return userRepository.findAll().stream().map(user -> {
            Map<String, Object> u = new LinkedHashMap<>();
            u.put("id", user.getId());
            u.put("username", user.getUsername());
            u.put("fullName", user.getFullName());
            u.put("email", user.getEmail());
            u.put("phone", user.getPhone());
            u.put("createdAt", user.getCreatedAt());
            u.put("lastLoginAt", user.getLastLoginAt());
            u.put("provider", user.getProvider());
            u.put("address", user.getAddress());
            return u;
        }).toList();
    }

    // Power BI Set Up data
    public Map<String, Object> getDashboard() {
        List<Ticket> tickets = ticketRepository.findAll();

        double totalRevenue = tickets.stream()
                .filter(t -> "paid".equalsIgnoreCase(t.getPaymentStatus()))
                .filter(t -> !"cancelled".equalsIgnoreCase(t.getStatus()))
                .mapToDouble(Ticket::getPrice)
                .sum();

        long totalTickets = tickets.size();

        Map<String, Long> ticketStatus = tickets.stream()
                .filter(t -> t.getStatus() != null)
                .collect(Collectors.groupingBy(
                        Ticket::getStatus,
                        LinkedHashMap::new,
                        Collectors.counting()));

        Map<String, Double> revenueByMovie = tickets.stream()
                .filter(t -> t.getMovieTitle() != null)
                .filter(t -> "paid".equalsIgnoreCase(t.getPaymentStatus()))
                .filter(t -> !"cancelled".equalsIgnoreCase(t.getStatus()))
                .collect(Collectors.groupingBy(
                        Ticket::getMovieTitle,
                        LinkedHashMap::new,
                        Collectors.summingDouble(Ticket::getPrice)));

        Map<String, Double> revenueByPaymentMethod = tickets.stream()
                .filter(t -> t.getPaymentMethod() != null)
                .filter(t -> "paid".equalsIgnoreCase(t.getPaymentStatus()))
                .filter(t -> !"cancelled".equalsIgnoreCase(t.getStatus()))
                .collect(Collectors.groupingBy(
                        Ticket::getPaymentMethod,
                        LinkedHashMap::new,
                        Collectors.summingDouble(Ticket::getPrice)));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalRevenue", totalRevenue);
        result.put("totalTickets", totalTickets);
        result.put("ticketStatus", ticketStatus);
        result.put("revenueByMovie", revenueByMovie);
        result.put("revenueByPaymentMethod", revenueByPaymentMethod);

        return result;
    }

    public List<Map<String, Object>> getRevenueByMovie() {
        return ticketRepository.findAll()
                .stream()
                .filter(t -> t.getMovieTitle() != null)
                .filter(t -> "paid".equalsIgnoreCase(t.getPaymentStatus()))
                .filter(t -> !"cancelled".equalsIgnoreCase(t.getStatus()))
                .collect(Collectors.groupingBy(
                        Ticket::getMovieTitle,
                        Collectors.summingDouble(Ticket::getPrice)))
                .entrySet()
                .stream()
                .map(entry -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("movieTitle", entry.getKey());
                    row.put("revenue", entry.getValue());
                    return row;
                })
                .toList();
    }
}
