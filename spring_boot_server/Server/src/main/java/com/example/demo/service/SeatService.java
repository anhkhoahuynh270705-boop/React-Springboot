package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Seat;
import com.example.demo.model.SeatLayout;
import com.example.demo.model.Showtime;
import com.example.demo.repository.SeatLayoutRepository;
import com.example.demo.repository.SeatRepository;
import com.example.demo.repository.ShowtimeRepository;
import com.example.demo.util.SeatLockUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository seatRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatLayoutRepository seatLayoutRepository;
    private final StringRedisTemplate redisTemplate;

    public List<Seat> getAllSeats() {
        return seatRepository.findAll();
    }

    public Optional<Seat> getSeatById(String id) {
        return seatRepository.findById(id);
    }

    public List<Seat> getSeatsByShowtime(String showtimeId) {
        List<Seat> seats = seatRepository.findByShowtimeId(showtimeId);
        // Overlay Redis lock status: only for seats NOT permanently booked in DB
        for (Seat seat : seats) {
            if (!seat.isBooked()) {
                String lockOwner = redisTemplate.opsForValue()
                        .get(SeatLockUtils.lockKey(showtimeId, seat.getId()));
                if (lockOwner != null) {
                    seat.setTempLockedBy(lockOwner);
                }
            }
        }
        return seats;
    }

    public Seat createSeat(Seat seat) {
        return seatRepository.save(seat);
    }

    public List<Seat> createMultipleSeats(List<Seat> seats) {
        return seatRepository.saveAll(seats);
    }

    public Seat updateSeat(String id, Seat seat) {
        Seat existingSeat = seatRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seat", "id", id));

        seat.setId(existingSeat.getId());

        return seatRepository.save(seat);
    }

    public Seat bookSeat(String id, Map<String, String> request) {
        Seat seat = seatRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seat", "id", id));

        String userId = getUserIdFromRequest(request);

        if (seat.isBooked() && seat.getBookedBy() != null && !seat.getBookedBy().trim().isEmpty()) {
            throw new BadRequestException("Seat has already been booked");
        }

        seat.setBooked(true);
        seat.setBookedBy(userId);
        seat.setBookedAt(LocalDateTime.now().toString());

        return seatRepository.save(seat);
    }

    public Seat unbookSeat(String id, Map<String, String> request) {
        Seat seat = seatRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seat", "id", id));

        String userId = getUserIdFromRequest(request);

        if (!seat.isBooked() || seat.getBookedBy() == null || seat.getBookedBy().trim().isEmpty()) {
            throw new BadRequestException("Seat is not booked");
        }

        if (!userId.equals(seat.getBookedBy())) {
            throw new BadRequestException("You do not have the right to cancel this reservation.");
        }

        seat.setBooked(false);
        seat.setBookedBy(null);
        seat.setBookedAt(null);

        return seatRepository.save(seat);
    }

    public void deleteSeat(String id) {
        if (!seatRepository.existsById(id)) {
            throw new ResourceNotFoundException("Seat", "id", id);
        }

        seatRepository.deleteById(id);
    }

    public void deleteSeatsByShowtime(String showtimeId) {
        List<Seat> seats = seatRepository.findByShowtimeId(showtimeId);

        if (seats.isEmpty()) {
            throw new ResourceNotFoundException("Seats for showtime", "showtimeId", showtimeId);
        }

        seatRepository.deleteAll(seats);
    }

    @Transactional
    public List<Seat> applyLayoutToShowtime(String showtimeId, String layoutId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime", "id", showtimeId));

        SeatLayout layout = seatLayoutRepository.findById(layoutId)
                .orElseThrow(() -> new ResourceNotFoundException("SeatLayout", "id", layoutId));

        boolean hasBookedSeats = seatRepository.existsByShowtimeIdAndBookedTrue(showtimeId);

        if (hasBookedSeats) {
            throw new BadRequestException("Cannot change layout because some seats are already booked");
        }

        seatRepository.deleteByShowtimeId(showtimeId);

        List<Seat> seats = layout.getSeats().stream()
                .map(item -> {
                    Seat seat = new Seat();

                    seat.setShowtimeId(showtimeId);
                    seat.setSeatNumber(item.getSeatNumber());
                    seat.setRow(item.getRow());
                    seat.setColumn(item.getColumn());

                    seat.setRowIndex(item.getRowIndex());
                    seat.setColIndex(item.getColIndex());
                    seat.setColSpan(item.getColSpan());

                    seat.setSeatType(item.getSeatType());

                    if (item.getPrice() > 0) {
                        seat.setPrice(item.getPrice());
                    } else {
                        seat.setPrice(showtime.getPrice());
                    }

                    seat.setBooked(false);
                    seat.setBookedBy(null);
                    seat.setBookedAt(null);

                    return seat;
                })
                .toList();

        List<Seat> savedSeats = seatRepository.saveAll(seats);

        showtime.setLayoutId(layout.getId());
        showtime.setLayoutName(layout.getName());
        showtime.setTotalRows(layout.getTotalRows());
        showtime.setTotalCols(layout.getTotalCols());
        showtime.setTotalSeats(savedSeats.size());
        showtime.setAvailableSeats(savedSeats.size());

        showtimeRepository.save(showtime);

        return savedSeats;
    }

    private String getUserIdFromRequest(Map<String, String> request) {
        if (request == null) {
            throw new BadRequestException("Request body is required");
        }

        String userId = request.get("userId");

        if (userId == null || userId.trim().isEmpty()) {
            throw new BadRequestException("UserId not provided");
        }

        return userId;
    }
}