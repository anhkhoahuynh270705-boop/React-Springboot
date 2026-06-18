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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Cinema;
import com.example.demo.service.CinemaService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cinemas")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CinemaController {

    private final CinemaService cinemaService;
    
    @GetMapping
    public List<Cinema> getAllCinemas() {
        return cinemaService.getAllCinemas();
    }

    // Get cinema by ID
    @GetMapping("/{id}")
    public ResponseEntity<Cinema> getCinemaById(@PathVariable String id) {
        return ResponseEntity.ok(cinemaService.getCinemaById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cinema", "id", id)));
    }
    
    // Search cinemas 
    @GetMapping("/search")
    public List<Cinema> searchCinemas(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String status) {
        return cinemaService.searchCinemas(name, city, status);
    }
    
    // Get active cinemas 
    @GetMapping("/active")
    public List<Cinema> getActiveCinemas() {
        return cinemaService.getActiveCinemas();
    }
    
    // Get cinemas by movie ID
    @GetMapping("/movie/{movieId}")
    public List<Cinema> getCinemasByMovie(@PathVariable String movieId) {
        return cinemaService.getCinemasByMovie(movieId);
    }
        
    // Get movie counts for each cinema
    @GetMapping("/movie-counts")
    public Map<String, Integer> getCinemaMovieCounts() {
        try {
            return cinemaService.getCinemaMovieCounts();
        } catch (Exception e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }
    
    // Create a new cinema
    @PostMapping
    public Cinema createCinema(@RequestBody Cinema cinema) {
        return cinemaService.createCinema(cinema);
    }
    
    // Update an existing cinema
    @PutMapping("/{id}")
    public Cinema updateCinema(@PathVariable String id, @RequestBody Cinema cinema) {
        return cinemaService.updateCinema(id, cinema);
    }
    
    // Delete a cinema
    @DeleteMapping("/{id}")
    public void deleteCinema(@PathVariable String id) {
        cinemaService.deleteCinema(id);
    }
    
    // Add or remove a movie from a cinema
    @PostMapping("/{cinemaId}/movies/{movieId}")
    public Cinema addMovieToCinema(@PathVariable String cinemaId, @PathVariable String movieId) {
        try {
            return cinemaService.addMovieToCinema(cinemaId, movieId);
        } catch (Exception e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }
    
    // Remove a movie from a cinema
    @DeleteMapping("/{cinemaId}/movies/{movieId}")
    public Cinema removeMovieFromCinema(@PathVariable String cinemaId, @PathVariable String movieId) {
        try {
            return cinemaService.removeMovieFromCinema(cinemaId, movieId);
        } catch (Exception e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }

}