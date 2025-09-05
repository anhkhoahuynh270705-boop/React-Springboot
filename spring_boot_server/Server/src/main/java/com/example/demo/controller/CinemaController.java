package com.example.demo.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

import com.example.demo.model.Cinema;
import com.example.demo.repository.CinemaRepository;

@RestController
@RequestMapping("/api/cinemas")
@CrossOrigin(origins = "*")
public class CinemaController {

    @Autowired
    private CinemaRepository cinemaRepository;

    @GetMapping
    public ResponseEntity<List<Cinema>> getAllCinemas() {
        try {
            List<Cinema> cinemas = cinemaRepository.findAll();
            return ResponseEntity.ok(cinemas);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cinema> getCinemaById(@PathVariable String id) {
        try {
            Optional<Cinema> cinema = cinemaRepository.findById(id);
            if (cinema.isPresent()) {
                return ResponseEntity.ok(cinema.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<Cinema>> getCinemasByCity(@PathVariable String city) {
        try {
            List<Cinema> cinemas = cinemaRepository.findByCity(city);
            return ResponseEntity.ok(cinemas);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Cinema>> searchCinemas(@RequestParam String name) {
        try {
            List<Cinema> cinemas = cinemaRepository.findByNameContainingIgnoreCase(name);
            return ResponseEntity.ok(cinemas);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<Cinema> addCinema(@RequestBody Cinema cinema) {
        try {
            // Basic validation
            if (cinema.getName() == null || cinema.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (cinema.getCity() == null || cinema.getCity().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            // Set default status if not provided
            if (cinema.getStatus() == null || cinema.getStatus().trim().isEmpty()) {
                cinema.setStatus("bán vé");
            }
            
            Cinema savedCinema = cinemaRepository.save(cinema);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedCinema);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cinema> updateCinema(@PathVariable String id, @RequestBody Cinema cinema) {
        try {
            if (!cinemaRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            
            // Basic validation
            if (cinema.getName() == null || cinema.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (cinema.getCity() == null || cinema.getCity().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            cinema.setId(id);
            Cinema updatedCinema = cinemaRepository.save(cinema);
            return ResponseEntity.ok(updatedCinema);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCinema(@PathVariable String id) {
        try {
            if (!cinemaRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            
            cinemaRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
