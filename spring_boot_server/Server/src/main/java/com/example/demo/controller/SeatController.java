package com.example.demo.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Seat;
import com.example.demo.repository.SeatRepository;

@RestController
@RequestMapping("/api/seats")
@CrossOrigin(origins = "*")
public class SeatController {
    @Autowired
    private SeatRepository seatRepository;

    @GetMapping
    public List<Seat> getAllSeats() {
        return seatRepository.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Seat> getSeatById(@PathVariable String id) {
        return seatRepository.findById(id);
    }

    // Lấy ghế theo showtime
    @GetMapping("/showtime/{showtimeId}")
    public List<Seat> getSeatsByShowtime(@PathVariable String showtimeId) {
        return seatRepository.findByShowtimeId(showtimeId);
    }

    @PostMapping
    public Seat createSeat(@RequestBody Seat seat) {
        return seatRepository.save(seat);
    }

    // Tạo nhiều ghế cùng lúc
    @PostMapping("/batch")
    public List<Seat> createMultipleSeats(@RequestBody List<Seat> seats) {
        return seatRepository.saveAll(seats);
    }

    @PutMapping("/{id}")
    public Seat updateSeat(@PathVariable String id, @RequestBody Seat seat) {
        seat.setId(id);
        return seatRepository.save(seat);
    }

    // Đặt ghế
    @PutMapping("/{id}/book")
    public Seat bookSeat(@PathVariable String id) {
        Optional<Seat> seatOpt = seatRepository.findById(id);
        if (seatOpt.isPresent()) {
            Seat seat = seatOpt.get();
            seat.setBooked(true);
            return seatRepository.save(seat);
        }
        return null;
    }

    @PutMapping("/{id}/unbook")
    public Seat unbookSeat(@PathVariable String id) {
        Optional<Seat> seatOpt = seatRepository.findById(id);
        if (seatOpt.isPresent()) {
            Seat seat = seatOpt.get();
            seat.setBooked(false);
            return seatRepository.save(seat);
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteSeat(@PathVariable String id) {
        seatRepository.deleteById(id);
    }
}