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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Cinema;
import com.example.demo.repository.CinemaRepository;
import com.example.demo.service.MovieCinemaService;

@RestController
@RequestMapping("/api/cinemas")
@CrossOrigin(origins = "*")
public class CinemaController {
    
    @Autowired
    private CinemaRepository cinemaRepository;
    
    @Autowired
    private MovieCinemaService movieCinemaService;
    
    @GetMapping
    public List<Cinema> getAllCinemas() {
        List<Cinema> cinemas = cinemaRepository.findAll();
        // Đảm bảo movieIds không null
        for (Cinema cinema : cinemas) {
            if (cinema.getMovieIds() == null) {
                cinema.setMovieIds(new java.util.ArrayList<>());
            }
        }
        return cinemas;
    }
    
    @GetMapping("/{id}")
    public Optional<Cinema> getCinemaById(@PathVariable String id) {
        return cinemaRepository.findById(id);
    }
    
    @GetMapping("/search")
    public List<Cinema> searchCinemas(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String status) {
        
        if (name != null && city != null) {
            return cinemaRepository.findByNameContainingIgnoreCaseAndCity(name, city);
        } else if (name != null) {
            return cinemaRepository.findByNameContainingIgnoreCase(name);
        } else if (city != null) {
            return cinemaRepository.findByCity(city);
        } else if (status != null) {
            return cinemaRepository.findByStatus(status);
        } else {
            return cinemaRepository.findAll();
        }
    }
    
    @GetMapping("/active")
    public List<Cinema> getActiveCinemas() {
        return cinemaRepository.findByStatusOrderByNameAsc("Bán Vé");
    }
    
    @GetMapping("/movie/{movieId}")
    public List<Cinema> getCinemasByMovie(@PathVariable String movieId) {
        return cinemaRepository.findByMovieIdsContaining(movieId);
    }
    
    @PostMapping
    public Cinema createCinema(@RequestBody Cinema cinema) {
        // Set default values if not provided
        if (cinema.getStatus() == null || cinema.getStatus().trim().isEmpty()) {
            cinema.setStatus("Bán Vé");
        }
        if (cinema.getFacilities() == null) {
            cinema.setFacilities(new java.util.ArrayList<>());
        }
        if (cinema.getMovieIds() == null) {
            cinema.setMovieIds(new java.util.ArrayList<>());
        }
        
        return cinemaRepository.save(cinema);
    }
    
    @PutMapping("/{id}")
    public Cinema updateCinema(@PathVariable String id, @RequestBody Cinema cinema) {
        cinema.setId(id);
        return cinemaRepository.save(cinema);
    }
    
    @DeleteMapping("/{id}")
    public void deleteCinema(@PathVariable String id) {
        cinemaRepository.deleteById(id);
    }
    
    @PostMapping("/{cinemaId}/movies/{movieId}")
    public Cinema addMovieToCinema(@PathVariable String cinemaId, @PathVariable String movieId) {
        try {
            boolean success = movieCinemaService.addMovieToCinema(movieId, cinemaId);
            if (success) {
                Optional<Cinema> cinemaOpt = cinemaRepository.findById(cinemaId);
                if (cinemaOpt.isPresent()) {
                    return cinemaOpt.get();
                }
            }
            return null;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi thêm phim vào rạp chiếu: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{cinemaId}/movies/{movieId}")
    public Cinema removeMovieFromCinema(@PathVariable String cinemaId, @PathVariable String movieId) {
        try {
            boolean success = movieCinemaService.removeMovieFromCinema(movieId, cinemaId);
            if (success) {
                Optional<Cinema> cinemaOpt = cinemaRepository.findById(cinemaId);
                if (cinemaOpt.isPresent()) {
                    return cinemaOpt.get();
                }
            }
            return null;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xóa phim khỏi rạp chiếu: " + e.getMessage());
        }
    }
    
    // Lấy số phim của từng rạp chiếu
    @GetMapping("/movie-counts")
    public java.util.Map<String, Integer> getCinemaMovieCounts() {
        try {
            List<Cinema> cinemas = cinemaRepository.findAll();
            java.util.Map<String, Integer> movieCounts = new java.util.HashMap<>();
            
            for (Cinema cinema : cinemas) {
                int count = cinema.getMovieIds() != null ? cinema.getMovieIds().size() : 0;
                movieCounts.put(cinema.getId(), count);
            }
            
            return movieCounts;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy số phim của rạp chiếu: " + e.getMessage());
        }
    }
}