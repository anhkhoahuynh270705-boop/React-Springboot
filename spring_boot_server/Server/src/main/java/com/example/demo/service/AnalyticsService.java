package com.example.demo.service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.List;
import org.springframework.stereotype.Service;

import com.example.demo.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import com.example.demo.model.Ticket;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private final TicketRepository ticketRepository;

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
