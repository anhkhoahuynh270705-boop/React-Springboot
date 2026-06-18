package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Seat;
import com.example.demo.service.SeatService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/seats")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    // Get all seats
    @GetMapping
    public List<Seat> getAllSeats() {
        return seatService.getAllSeats();
    }

    // Get seat by ID
    @GetMapping("/{id}")
    public ResponseEntity<Seat> getSeatById(@PathVariable String id) {
        return ResponseEntity.ok(seatService.getSeatById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seat", "id", id)));
    }

    // Get seats by showtime ID
    @GetMapping("/showtime/{showtimeId}")
    public List<Seat> getSeatsByShowtime(@PathVariable String showtimeId) {
        return seatService.getSeatsByShowtime(showtimeId);
    }

    // Create a single seat
    @PostMapping
    public Seat createSeat(@RequestBody Seat seat) {
        return seatService.createSeat(seat);
    }

    // Create multiple seats at once
    @PostMapping("/batch")
    public List<Seat> createMultipleSeats(@RequestBody List<Seat> seats) {
        return seatService.createMultipleSeats(seats);
    }

    // Apply a seat layout template to a showtime
    @PostMapping("/showtime/{showtimeId}/apply-layout/{layoutId}")
    public List<Seat> applyLayoutToShowtime(
            @PathVariable String showtimeId,
            @PathVariable String layoutId) {
        return seatService.applyLayoutToShowtime(showtimeId, layoutId);
    }

    // Update a seat
    @PutMapping("/{id}")
    public Seat updateSeat(@PathVariable String id, @RequestBody Seat seat) {
        return seatService.updateSeat(id, seat);
    }

    // Book a seat
    @PutMapping("/{id}/book")
    public Seat bookSeat(@PathVariable String id, @RequestBody Map<String, String> request) {
        return seatService.bookSeat(id, request);
    }

    // Unbook a seat
    @PutMapping("/{id}/unbook")
    public Seat unbookSeat(@PathVariable String id, @RequestBody Map<String, String> request) {
        return seatService.unbookSeat(id, request);
    }

    // Delete a single seat
    @DeleteMapping("/{id}")
    public void deleteSeat(@PathVariable String id) {
        seatService.deleteSeat(id);
    }

    // Delete all seats for a showtime
    @DeleteMapping("/showtime/{showtimeId}")
    public void deleteSeatsByShowtime(@PathVariable String showtimeId) {
        seatService.deleteSeatsByShowtime(showtimeId);
    }
}