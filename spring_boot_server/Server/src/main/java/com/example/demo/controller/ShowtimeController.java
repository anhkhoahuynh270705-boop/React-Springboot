package com.example.demo.controller;

import java.util.List;

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

import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Showtime;
import com.example.demo.service.ShowtimeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/showtimes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ShowtimeController {

    private final ShowtimeService showtimeService;

    // Get all showtimes
    @GetMapping
    public List<Showtime> getAllShowtimes() {
        return showtimeService.getAllShowtimes();
    }

    // Get showtime by ID
    @GetMapping("/{id}")
    public ResponseEntity<Showtime> getShowtimeById(@PathVariable String id) {
        return ResponseEntity.ok(showtimeService.getShowtimeById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime", "id", id)));
    }

    // Get showtimes by movie ID (path variable)
    @GetMapping("/movie/{movieId}")
    public List<Showtime> getShowtimesByMovieId(@PathVariable String movieId) {
        return showtimeService.getShowtimesByMovie(movieId);
    }

    // Get showtimes by movie ID (request param)
    @GetMapping(params = "movieId")
    public List<Showtime> getShowtimesByMovieIdParam(@RequestParam String movieId) {
        return showtimeService.getShowtimesByMovie(movieId);
    }

    // Get showtimes by cinema ID
    @GetMapping("/cinema/{cinemaId}")
    public List<Showtime> getShowtimesByCinemaId(@PathVariable String cinemaId) {
        return showtimeService.getShowtimesByCinema(cinemaId);
    }

    // Get showtimes by cinema ID and movie ID
    @GetMapping("/cinema/{cinemaId}/movie/{movieId}")
    public List<Showtime> getShowtimesByCinemaAndMovie(
            @PathVariable String cinemaId,
            @PathVariable String movieId) {
        return showtimeService.getShowtimesByCinemaAndMovie(cinemaId, movieId);
    }

    // Get showtimes by cinema ID and date
    @GetMapping("/cinema/{cinemaId}/date/{date}")
    public List<Showtime> getShowtimesByDateAndCinema(
            @PathVariable String cinemaId,
            @PathVariable String date) {
        return showtimeService.getShowtimesByDateAndCinema(cinemaId, date);
    }

    // Create a new showtime
    @PostMapping
    public Showtime createShowtime(@RequestBody Showtime showtime) {
        return showtimeService.createShowtime(showtime);
    }

    // Update a showtime
    @PutMapping("/{id}")
    public Showtime updateShowtime(@PathVariable String id, @RequestBody Showtime showtime) {
        return showtimeService.updateShowtime(id, showtime);
    }

    // Delete a showtime
    @DeleteMapping("/{id}")
    public boolean deleteShowtime(@PathVariable String id) {
        return showtimeService.deleteShowtime(id);
    }
}
