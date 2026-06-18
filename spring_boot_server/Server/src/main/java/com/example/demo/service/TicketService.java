package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Notification;
import com.example.demo.model.Seat;
import com.example.demo.model.Ticket;
import com.example.demo.model.User;
import com.example.demo.repository.SeatRepository;
import com.example.demo.repository.TicketRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.DateUtils;
import com.example.demo.util.OrderIdGenerator;

import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class TicketService {
    private final TicketRepository ticketRepository;
    
    private final NotificationService notificationService;
    
    private final UserRepository userRepository;

    private final SeatRepository seatRepository;

    private final SeatLockService seatLockService;

    public List<Ticket> getAllTickets() {
        
        return ticketRepository.findAll();
    }

    public Optional<Ticket> getTicketById(String id) {
        return ticketRepository.findById(id);
    }

    public List<Ticket> getTicketsByUser(String userId) {
        return ticketRepository.findByUserId(userId);
    }

    public Ticket createTicket(Ticket ticket) {
        if (ticket.getBookingTime() == null || ticket.getBookingTime().isEmpty()) {
            ticket.setBookingTime(DateUtils.nowIso());
        }
        if (ticket.getTicketNumber() == null || ticket.getTicketNumber().isEmpty()) {
            ticket.setTicketNumber(OrderIdGenerator.ticketNumber());
        }
        if (ticket.getQrCode() == null || ticket.getQrCode().isEmpty()) {
            ticket.setQrCode(OrderIdGenerator.qrCode());
        }
        
        // Set default values
        if (ticket.getStatus() == null || ticket.getStatus().isEmpty()) {
            ticket.setStatus("confirmed");
        }
        if (ticket.getPaymentStatus() == null || ticket.getPaymentStatus().isEmpty()) {
            ticket.setPaymentStatus("paid");
        }
        if (!ticket.isRefundable()) {
            ticket.setRefundable(true);
        }
        
        // Save user info into ticket
        if (ticket.getUserId() != null) {
            Optional<User> userOpt = userRepository.findById(ticket.getUserId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                ticket.setUserName(user.getFullName());
                ticket.setUserEmail(user.getEmail());
            }
        }
        return ticketRepository.save(ticket);
    }

    private List<String> splitSeatIds(String seatIdText) {
        if (seatIdText == null || seatIdText.isBlank()) {
            return List.of();
        }

        return Arrays.stream(seatIdText.split(","))
                .map(String::trim)
                .filter(id -> !id.isBlank())
                .toList();
    }
    @Transactional
    public Ticket bookTicket(Ticket ticket) {
        if (ticket.getUserId() == null || ticket.getUserId().isEmpty()) {
            throw new BadRequestException("User ID is required");
        }
        if (ticket.getShowtimeId() == null || ticket.getShowtimeId().isEmpty()) {
            throw new BadRequestException("Showtime ID is required");
        }
        if (ticket.getMovieId() == null || ticket.getMovieId().isEmpty()) {
            throw new BadRequestException("Movie ID is required");
        }
        if (ticket.getSeatId() == null || ticket.getSeatId().isEmpty()) {
            throw new BadRequestException("Seat ID is required");
        }
        if (ticket.getSeatNumber() == null || ticket.getSeatNumber().isEmpty()) {
            throw new BadRequestException("Seat number is required");
        }

        List<String> seatIds = splitSeatIds(ticket.getSeatId());
        if (seatIds.isEmpty()) {
            throw new BadRequestException("Seat IDs are required");
        }

        seatLockService.validateSeatsLockedByUser(
                ticket.getShowtimeId(),
                seatIds,
                ticket.getUserId()
        );

        for (String seatId : seatIds) {
            Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new ResourceNotFoundException("Seat", "id", seatId));
            if (Boolean.TRUE.equals(seat.isBooked())) {
                throw new BadRequestException("Seat already booked: " + seat.getSeatNumber());
            }
        }

        if (ticket.getBookingTime() == null || ticket.getBookingTime().isEmpty()) {
            ticket.setBookingTime(DateUtils.nowIso());
        }
        if (ticket.getTicketNumber() == null || ticket.getTicketNumber().isEmpty()) {
            ticket.setTicketNumber(OrderIdGenerator.ticketNumber());
        }
        if (ticket.getQrCode() == null || ticket.getQrCode().isEmpty()) {
            ticket.setQrCode(OrderIdGenerator.qrCode());
        }

        if (ticket.getStatus() == null || ticket.getStatus().isEmpty()) {
            ticket.setStatus("pending");
        }
        if (ticket.getPaymentStatus() == null || ticket.getPaymentStatus().isEmpty()) {
            ticket.setPaymentStatus("pending");
        }
        if (!ticket.isRefundable()) {
            ticket.setRefundable(true);
        }

        if (ticket.getUserId() != null) {
            userRepository.findById(ticket.getUserId()).ifPresent(user -> {
                ticket.setUserName(user.getFullName());
                ticket.setUserEmail(user.getEmail());
            });
        }

        for (String seatId : seatIds) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new ResourceNotFoundException("Seat", "id", seatId));

        seat.setBooked(true);
        seat.setBookedBy(ticket.getUserId());
        seat.setBookedAt(DateUtils.nowIso());

        seatRepository.save(seat);
    }

    Ticket savedTicket = ticketRepository.save(ticket);

    seatLockService.releaseSeats(
            ticket.getShowtimeId(),
            seatIds,
            ticket.getUserId()
    );

    return savedTicket;
}
    public Ticket updateTicket(String id, Ticket ticket) {
        ticket.setId(id);
        return ticketRepository.save(ticket);
    }

    public void deleteTicket(String id) {
        ticketRepository.deleteById(id);
    }

    public Ticket cancelTicket(String id, String reason) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));

        if (!"confirmed".equals(ticket.getStatus())) {
            throw new IllegalStateException("Only confirmed tickets can be cancelled");
        }
        
        ticket.setStatus("cancelled");
        ticket.setCancelledAt(LocalDateTime.now());
        ticket.setCancellationReason(reason != null ? reason : "User cancelled");
        
        return ticketRepository.save(ticket);
    }

    public Ticket markTicketAsUsed(String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));

        if (!"confirmed".equals(ticket.getStatus())) {
            throw new IllegalStateException("Only confirmed tickets can be used");
        }
        
        ticket.setStatus("used");
        ticket.setUsedAt(LocalDateTime.now());
        
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getTicketsByStatus(String status) {
        return ticketRepository.findByStatus(status);
    }

    public List<Ticket> getTicketsByShowtime(String showtimeId) {
        return ticketRepository.findByShowtimeId(showtimeId);
    }

    public Object getUserTicketStats(String userId) {
        List<Ticket> tickets = ticketRepository.findByUserId(userId);
        
        return new Object() {
            @SuppressWarnings("unused")
            public final long totalTickets = tickets.size();
            @SuppressWarnings("unused")
            public final long confirmedTickets = tickets.stream().filter(t -> "confirmed".equals(t.getStatus())).count();
            @SuppressWarnings("unused")
            public final long usedTickets = tickets.stream().filter(t -> "used".equals(t.getStatus())).count();
            @SuppressWarnings("unused")
            public final long cancelledTickets = tickets.stream().filter(t -> "cancelled".equals(t.getStatus())).count();
            @SuppressWarnings("unused")
            public final double totalSpent = tickets.stream().mapToDouble(Ticket::getPrice).sum();
            @SuppressWarnings("unused")
            public final long refundedTickets = tickets.stream().filter(t -> t.getRefundedAt() != null).count();
            @SuppressWarnings("unused")
            public final double totalRefundAmount = tickets.stream()
                    .filter(t -> t.getRefundedAt() != null)
                    .mapToDouble(Ticket::getRefundAmount)
                    .sum();
        };
    }

    public Object getTicketPaymentInfo(String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));
        return new Object() {
            @SuppressWarnings("unused")
            public final String paymentMethod = ticket.getPaymentMethod();
            @SuppressWarnings("unused")
            public final String paymentStatus = ticket.getPaymentStatus();
            @SuppressWarnings("unused")
            public final double price = ticket.getPrice();
            @SuppressWarnings("unused")
            public final String bookingTime = ticket.getBookingTime();
        };
    }

    public Ticket refundTicket(String id, double refundAmount, String refundReason) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));
        if (!"cancelled".equals(ticket.getStatus())) {
            throw new IllegalStateException("Only cancelled tickets can be refunded");
        }
        
        if (!ticket.isRefundable()) {
            throw new IllegalStateException("Ticket is not refundable");
        }
        
        ticket.setRefundAmount(refundAmount);
        ticket.setRefundedAt(LocalDateTime.now());
        ticket.setRefundReason(refundReason);
        
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getRefundedTickets() {
        return ticketRepository.findAll().stream()
                .filter(ticket -> ticket.getRefundedAt() != null)
                .collect(Collectors.toList());
    }

    public Object getUserRefundStats(String userId) {
        List<Ticket> tickets = ticketRepository.findByUserId(userId);
        
        List<Ticket> refundedTickets = tickets.stream()
                .filter(ticket -> ticket.getRefundedAt() != null)
                .collect(Collectors.toList());
        
        return new Object() {
            @SuppressWarnings("unused")
            public final long totalRefundedTickets = refundedTickets.size();
            public final double totalRefundAmount = refundedTickets.stream()
                    .mapToDouble(Ticket::getRefundAmount)
                    .sum();
            @SuppressWarnings("unused")
            public final double averageRefundAmount = refundedTickets.size() > 0 ? 
                    totalRefundAmount / refundedTickets.size() : 0;
        };
    }

    public Ticket updatePaymentMethod(String id, String paymentMethod) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));
        ticket.setPaymentMethod(paymentMethod);
        
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getTicketsByPaymentMethod(String paymentMethod) {
        return ticketRepository.findAll().stream()
                .filter(ticket -> paymentMethod.equals(ticket.getPaymentMethod()))
                .collect(Collectors.toList());
    }

    public List<Ticket> getTicketsByCinemaAddress(String address) {
        return ticketRepository.findAll().stream()
                .filter(ticket -> address.equals(ticket.getCinemaAddress()))
                .collect(Collectors.toList());
    }

    public Ticket approveTicket(String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));
        if (!"pending".equals(ticket.getStatus())) {
            throw new IllegalStateException("Just pending tickets can be approved");
        }

        ticket.setStatus("confirmed");
        
        Ticket updatedTicket = ticketRepository.save(ticket);
        
        try {
            Notification notification = new Notification();
            notification.setUserId(ticket.getUserId());
            notification.setTitle("Ticket Approved");
            notification.setMessage("Ticket " + (ticket.getTicketNumber() != null ? ticket.getTicketNumber() : ticket.getId()) +
                " for movie \"" + ticket.getMovieTitle() + "\" has been approved by admin and ready to use.");
            notification.setType("ticket_approved");
            notification.setRelatedType("ticket");
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());

            // Using NotificationService so WebSocket push is triggered automatically
            notificationService.createNotification(notification);
            System.out.println("[WebSocket] Notification pushed for ticket approval: " + ticket.getId());
        } catch (Exception notificationError) {
            System.err.println("Error creating notification: " + notificationError.getMessage());
        }
        
        return updatedTicket;
    }
}
