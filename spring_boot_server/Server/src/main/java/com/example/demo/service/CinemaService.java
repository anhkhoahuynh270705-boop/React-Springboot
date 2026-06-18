package com.example.demo.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.model.Cinema;
import com.example.demo.repository.CinemaRepository;

import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class CinemaService {
    
    private final CinemaRepository cinemaRepository;

    private final MovieCinemaService movieCinemaService;

    public List<Cinema> getAllCinemas() {
        List<Cinema> cinemas = cinemaRepository.findAll();
        for (Cinema cinema : cinemas) {
            if (cinema.getMovieIds() == null) {
                cinema.setMovieIds(new ArrayList<>());
            }
        }
        return cinemas;
    }

    public Optional<Cinema> getCinemaById(String id) {
        return cinemaRepository.findById(id);
    }

    public List<Cinema> searchCinemas(String name, String city, String status) {
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

    public List<Cinema> getActiveCinemas() {
        return cinemaRepository.findByStatusOrderByNameAsc("Selling Tickets");
    }

    public List<Cinema> getCinemasByMovie(String movieId) {
        return cinemaRepository.findByMovieIdsContaining(movieId);
    }

    public Cinema createCinema(Cinema cinema) {
        if (cinema.getStatus() == null || cinema.getStatus().trim().isEmpty()) {
            cinema.setStatus("Selling Tickets");
        }
        if (cinema.getFacilities() == null) {
            cinema.setFacilities(new ArrayList<>());
        }
        if (cinema.getMovieIds() == null) {
            cinema.setMovieIds(new ArrayList<>());
        }

        return cinemaRepository.save(cinema);
    }

    public Cinema updateCinema(String id, Cinema cinema) {
        cinema.setId(id);
        return cinemaRepository.save(cinema);
    }

    public void deleteCinema(String id) {
        cinemaRepository.deleteById(id);
    }

    public Cinema addMovieToCinema(String cinemaId, String movieId) {
        boolean success = movieCinemaService.addMovieToCinema(movieId, cinemaId);
        if (success) {
            Optional<Cinema> cinemaOpt = cinemaRepository.findById(cinemaId);
            if (cinemaOpt.isPresent()) {
                return cinemaOpt.get();
            }
        }
        return null;
    }

    public Cinema removeMovieFromCinema(String cinemaId, String movieId) {
        boolean success = movieCinemaService.removeMovieFromCinema(movieId, cinemaId);
        if (success) {
            Optional<Cinema> cinemaOpt = cinemaRepository.findById(cinemaId);
            if (cinemaOpt.isPresent()) {
                return cinemaOpt.get();
            }
        }
        return null;
    }

    public Map<String, Integer> getCinemaMovieCounts() {
        List<Cinema> cinemas = cinemaRepository.findAll();
        Map<String, Integer> movieCounts = new HashMap<>();

        for (Cinema cinema : cinemas) {
            int count = cinema.getMovieIds() != null ? cinema.getMovieIds().size() : 0;
            movieCounts.put(cinema.getId(), count);
        }
        return movieCounts;
    }
}
