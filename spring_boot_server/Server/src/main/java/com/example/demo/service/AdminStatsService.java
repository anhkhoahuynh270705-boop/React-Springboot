package com.example.demo.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.demo.model.Ticket;
import com.example.demo.model.User;
import com.example.demo.repository.TicketRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.AdminStatsCalculator;
import com.example.demo.util.ResponseUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminStatsService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public Map<String, Object> getStats() {
        long totalTickets = ticketRepository.count();
        long totalUsers = userRepository.count();

        long confirmedTickets = ticketRepository.findByStatus("confirmed").size();
        long usedTickets = ticketRepository.findByStatus("used").size();
        long cancelledTickets = ticketRepository.findByStatus("cancelled").size();
        long pendingTickets = ticketRepository.findByStatus("pending").size();

        List<Ticket> allTickets = ticketRepository.findAll();
        List<User> allUsers = userRepository.findAll();

        double totalRevenue = allTickets.stream()
                .filter(AdminStatsCalculator::countsTowardRevenue)
                .mapToDouble(Ticket::getPrice)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTickets", totalTickets);
        stats.put("totalUsers", totalUsers);
        stats.put("confirmedTickets", confirmedTickets);
        stats.put("usedTickets", usedTickets);
        stats.put("cancelledTickets", cancelledTickets);
        stats.put("pendingTickets", pendingTickets);
        stats.put("totalRevenue", totalRevenue);
        stats.put("monthlyRevenue", AdminStatsCalculator.buildMonthlyRevenue(allTickets));
        stats.put("weeklyTicketSales", AdminStatsCalculator.buildWeeklyTicketSales(allTickets));
        stats.put("weeklyUserGrowth", AdminStatsCalculator.buildWeeklyUserGrowth(allUsers));
        stats.put("popularMovies", AdminStatsCalculator.buildPopularMovies(allTickets));

        return ResponseUtils.success(null, "stats", stats);
    }
}
