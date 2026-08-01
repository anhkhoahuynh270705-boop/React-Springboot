package com.example.demo.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Arrays;

import org.springframework.stereotype.Service;

import com.example.demo.model.Cinema;
import com.example.demo.repository.CinemaRepository;

import jakarta.annotation.PostConstruct;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CinemaService {

    private final CinemaRepository cinemaRepository;

    private final MovieCinemaService movieCinemaService;

    private static final String DEFAULT_CINEMA_IMAGE = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop";

    @PostConstruct
    public void cleanupBloatedDatabaseData() {
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                List<Cinema> cinemas = cinemaRepository.findAll();
                int cleanedCount = 0;
                for (Cinema cinema : cinemas) {
                    boolean modified = false;
                    // Strip uncompressed oversized base64 (>150KB), but keep compressed uploaded
                    // images
                    if (cinema.getImageUrl() != null && cinema.getImageUrl().length() > 150000) {
                        cinema.setImageUrl(DEFAULT_CINEMA_IMAGE);
                        modified = true;
                    }
                    if (cinema.getMovieIds() == null) {
                        cinema.setMovieIds(new ArrayList<>());
                        modified = true;
                    }
                    if (cinema.getFacilities() == null) {
                        cinema.setFacilities(new ArrayList<>());
                        modified = true;
                    }
                    if (modified) {
                        cinemaRepository.save(cinema);
                        cleanedCount++;
                    }
                }
                if (cleanedCount > 0) {
                    System.out.println("[CinemaService] Successfully cleaned up " + cleanedCount
                            + " bloated Cinema documents in MongoDB database.");
                }
            } catch (Exception e) {
                System.err.println("[CinemaService] Database cleanup skipped or failed: " + e.getMessage());
            }
        });
    }

    private void sanitizeCinema(Cinema cinema) {
        if (cinema == null)
            return;
        if (cinema.getMovieIds() == null) {
            cinema.setMovieIds(new ArrayList<>());
        }
        if (cinema.getFacilities() == null) {
            cinema.setFacilities(new ArrayList<>());
        }
        // Strip uncompressed oversized base64
        if (cinema.getImageUrl() != null && cinema.getImageUrl().length() > 150000) {
            cinema.setImageUrl(DEFAULT_CINEMA_IMAGE);
        }
    }

    public List<Cinema> getAllCinemas() {
        Cinema[] cachedArray = getAllCinemasCached();
        return cachedArray != null ? new ArrayList<>(Arrays.asList(cachedArray)) : new ArrayList<>();
    }

    @Cacheable(value = "cinemas", key = "'all'")
    public Cinema[] getAllCinemasCached() {
        List<Cinema> cinemas = cinemaRepository.findAll();
        for (Cinema cinema : cinemas) {
            sanitizeCinema(cinema);
        }
        return cinemas.toArray(new Cinema[0]);
    }

    public Optional<Cinema> getCinemaById(String id) {
        Cinema cinema = getCinemaFromCacheOrDb(id);
        if (cinema != null) {
            sanitizeCinema(cinema);
        }
        return Optional.ofNullable(cinema);
    }

    @Cacheable(value = "cinemas", key = "#id", unless = "#result == null")
    public Cinema getCinemaFromCacheOrDb(String id) {
        Cinema cinema = cinemaRepository.findById(id).orElse(null);
        sanitizeCinema(cinema);
        return cinema;
    }

    public List<Cinema> searchCinemas(String name, String city, String status) {
        List<Cinema> result;
        if (name != null && city != null) {
            result = cinemaRepository.findByNameContainingIgnoreCaseAndCity(name, city);
        } else if (name != null) {
            result = cinemaRepository.findByNameContainingIgnoreCase(name);
        } else if (city != null) {
            result = cinemaRepository.findByCity(city);
        } else if (status != null) {
            result = cinemaRepository.findByStatus(status);
        } else {
            result = cinemaRepository.findAll();
        }
        result.forEach(this::sanitizeCinema);
        return result;
    }

    public List<Cinema> getActiveCinemas() {
        Cinema[] cachedArray = getActiveCinemasCached();
        return cachedArray != null ? new ArrayList<>(Arrays.asList(cachedArray)) : new ArrayList<>();
    }

    @Cacheable(value = "cinemas", key = "'active'")
    public Cinema[] getActiveCinemasCached() {
        List<Cinema> result = cinemaRepository.findByStatusOrderByNameAsc("Selling Tickets");
        if (result == null || result.isEmpty()) {
            result = cinemaRepository.findAll();
        }
        result.forEach(this::sanitizeCinema);
        return result.toArray(new Cinema[0]);
    }

    public List<Cinema> getCinemasByMovie(String movieId) {
        Cinema[] cachedArray = getCinemasByMovieCached(movieId);
        return cachedArray != null ? new ArrayList<>(Arrays.asList(cachedArray)) : new ArrayList<>();
    }

    @Cacheable(value = "cinemas", key = "'movie-' + #movieId")
    public Cinema[] getCinemasByMovieCached(String movieId) {
        List<Cinema> list = cinemaRepository.findByMovieIdsContaining(movieId);
        list.forEach(this::sanitizeCinema);
        return list.toArray(new Cinema[0]);
    }

    @CacheEvict(value = "cinemas", allEntries = true)
    public Cinema createCinema(Cinema cinema) {
        if (cinema.getStatus() == null || cinema.getStatus().trim().isEmpty()) {
            cinema.setStatus("Selling Tickets");
        }
        sanitizeCinema(cinema);
        return cinemaRepository.save(cinema);
    }

    @CacheEvict(value = "cinemas", allEntries = true)
    public Cinema updateCinema(String id, Cinema cinema) {
        cinema.setId(id);
        sanitizeCinema(cinema);
        return cinemaRepository.save(cinema);
    }

    @CacheEvict(value = "cinemas", allEntries = true)
    public void deleteCinema(String id) {
        cinemaRepository.deleteById(id);
    }

    @Caching(evict = {
            @CacheEvict(value = "movies", allEntries = true),
            @CacheEvict(value = "cinemas", allEntries = true)
    })
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

    @Caching(evict = {
            @CacheEvict(value = "movies", allEntries = true),
            @CacheEvict(value = "cinemas", allEntries = true)
    })
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
