package com.example.demo.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Ticket;
import com.example.demo.service.TicketService;
import com.example.demo.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    public List<Ticket> getAllTickets() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id)));
    }

    @GetMapping("/user/{userId}")
    public List<Ticket> getTicketsByUser(@PathVariable String userId) {
        return ticketService.getTicketsByUser(userId);
    }

    @PostMapping
    public Ticket createTicket(@RequestBody Ticket ticket) {
        return ticketService.createTicket(ticket);
    }

    @PostMapping("/book")
    public Ticket bookTicket(@RequestBody Ticket ticket) {
        return ticketService.bookTicket(ticket);
    }

    @PutMapping("/{id}")
    public Ticket updateTicket(@PathVariable String id, @RequestBody Ticket ticket) {
        return ticketService.updateTicket(id, ticket);
    }

    @DeleteMapping("/{id}")
    public void deleteTicket(@PathVariable String id) {
        ticketService.deleteTicket(id);
    }

    @PutMapping("/{id}/cancel")
    public Ticket cancelTicket(@PathVariable String id, @RequestParam(required = false) String reason) {
        return ticketService.cancelTicket(id, reason);
    }

    @PutMapping("/{id}/use")
    public Ticket markTicketAsUsed(@PathVariable String id) {
        return ticketService.markTicketAsUsed(id);
    }

    @GetMapping("/status/{status}")
    public List<Ticket> getTicketsByStatus(@PathVariable String status) {
        return ticketService.getTicketsByStatus(status);
    }

    @GetMapping("/showtime/{showtimeId}")
    public List<Ticket> getTicketsByShowtime(@PathVariable String showtimeId) {
        return ticketService.getTicketsByShowtime(showtimeId);
    }

    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<Object> getUserTicketStats(@PathVariable String userId) {
        return ResponseEntity.ok(ticketService.getUserTicketStats(userId));
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<Ticket> getTicketDetails(@PathVariable String id) {
        return ticketService.getTicketById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/payment-info")
    public ResponseEntity<Object> getTicketPaymentInfo(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketPaymentInfo(id));
    }

    @PutMapping("/{id}/refund")
    public Ticket refundTicket(
            @PathVariable String id,
            @RequestParam double refundAmount,
            @RequestParam String refundReason) {
        return ticketService.refundTicket(id, refundAmount, refundReason);
    }

    @GetMapping("/refunded")
    public List<Ticket> getRefundedTickets() {
        return ticketService.getRefundedTickets();
    }

    @GetMapping("/user/{userId}/refund-stats")
    public ResponseEntity<Object> getUserRefundStats(@PathVariable String userId) {
        return ResponseEntity.ok(ticketService.getUserRefundStats(userId));
    }

    @PutMapping("/{id}/payment-method")
    public Ticket updatePaymentMethod(@PathVariable String id, @RequestParam String paymentMethod) {
        return ticketService.updatePaymentMethod(id, paymentMethod);
    }

    @GetMapping("/payment-method/{paymentMethod}")
    public List<Ticket> getTicketsByPaymentMethod(@PathVariable String paymentMethod) {
        return ticketService.getTicketsByPaymentMethod(paymentMethod);
    }

    @GetMapping("/cinema-address/{address}")
    public List<Ticket> getTicketsByCinemaAddress(@PathVariable String address) {
        return ticketService.getTicketsByCinemaAddress(address);
    }

    @PutMapping("/{id}/approve")
    public Ticket approveTicket(@PathVariable String id) {
        return ticketService.approveTicket(id);
    }
}
