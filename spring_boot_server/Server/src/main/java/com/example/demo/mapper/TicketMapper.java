package com.example.demo.mapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.example.demo.model.Ticket;

public final class TicketMapper {

    private TicketMapper() {}

    public static Map<String, Object> toResponseMap(Ticket ticket) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", ticket.getId());
        map.put("ticketNumber", ticket.getTicketNumber());
        map.put("userId", ticket.getUserId());
        map.put("userName", ticket.getUserName());
        map.put("userEmail", ticket.getUserEmail());
        map.put("movieId", ticket.getMovieId());
        map.put("movieTitle", ticket.getMovieTitle());
        map.put("cinemaName", ticket.getCinemaName());
        map.put("cinemaAddress", ticket.getCinemaAddress());
        map.put("showtimeId", ticket.getShowtimeId());
        map.put("showDate", ticket.getShowDate());
        map.put("showTime", ticket.getShowTime());
        map.put("seatId", ticket.getSeatId());
        map.put("seatNumber", ticket.getSeatNumber());
        map.put("price", ticket.getPrice());
        map.put("status", ticket.getStatus());
        map.put("paymentStatus", ticket.getPaymentStatus());
        map.put("paymentMethod", ticket.getPaymentMethod());
        map.put("bookingTime", ticket.getBookingTime());
        map.put("qrCode", ticket.getQrCode());
        map.put("refundable", ticket.isRefundable());
        map.put("cancelledAt", ticket.getCancelledAt());
        map.put("cancellationReason", ticket.getCancellationReason());
        map.put("usedAt", ticket.getUsedAt());
        map.put("refundedAt", ticket.getRefundedAt());
        map.put("refundAmount", ticket.getRefundAmount());
        map.put("refundReason", ticket.getRefundReason());
        return map;
    }

    public static List<Map<String, Object>> toResponseMapList(List<Ticket> tickets) {
        return tickets.stream().map(TicketMapper::toResponseMap).toList();
    }
}
