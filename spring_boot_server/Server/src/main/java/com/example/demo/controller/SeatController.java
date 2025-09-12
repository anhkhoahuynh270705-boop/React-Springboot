package com.example.demo.controller;

import java.util.List;
import java.util.Map;
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
    public Seat bookSeat(@PathVariable String id, @RequestBody Map<String, String> request) {
        Optional<Seat> seatOpt = seatRepository.findById(id);
        if (seatOpt.isPresent()) {
            Seat seat = seatOpt.get();
            
            // Kiểm tra ghế đã được đặt chưa
            if (seat.isBooked() && seat.getBookedBy() != null && !seat.getBookedBy().trim().isEmpty()) {
                throw new RuntimeException("Ghế đã được đặt bởi người khác");
            }
            
            String userId = request.get("userId");
            if (userId == null || userId.trim().isEmpty()) {
                throw new RuntimeException("UserId không được để trống");
            }
            
            seat.setBooked(true);
            seat.setBookedBy(userId);
            seat.setBookedAt(java.time.LocalDateTime.now().toString());
            return seatRepository.save(seat);
        }
        throw new RuntimeException("Không tìm thấy ghế");
    }

    @PutMapping("/{id}/unbook")
    public Seat unbookSeat(@PathVariable String id, @RequestBody Map<String, String> request) {
        Optional<Seat> seatOpt = seatRepository.findById(id);
        if (seatOpt.isPresent()) {
            Seat seat = seatOpt.get();
            
            // Kiểm tra quyền hủy đặt ghế
            String userId = request.get("userId");
            if (userId == null || userId.trim().isEmpty()) {
                throw new RuntimeException("UserId không được để trống");
            }
            
            if (!seat.isBooked() || seat.getBookedBy() == null || seat.getBookedBy().trim().isEmpty()) {
                throw new RuntimeException("Ghế chưa được đặt");
            }
            
            if (!userId.equals(seat.getBookedBy())) {
                throw new RuntimeException("Bạn không có quyền hủy đặt ghế này");
            }
            
            seat.setBooked(false);
            seat.setBookedBy(null);
            seat.setBookedAt(null);
            return seatRepository.save(seat);
        }
        throw new RuntimeException("Không tìm thấy ghế");
    }

    @DeleteMapping("/{id}")
    public void deleteSeat(@PathVariable String id) {
        seatRepository.deleteById(id);
    }

    // Xóa tất cả ghế theo showtime
    @DeleteMapping("/showtime/{showtimeId}")
    public void deleteSeatsByShowtime(@PathVariable String showtimeId) {
        seatRepository.deleteByShowtimeId(showtimeId);
    }
}