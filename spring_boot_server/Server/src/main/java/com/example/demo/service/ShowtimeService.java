package com.example.demo.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.ShowtimeMapper;
import com.example.demo.model.Cinema;
import com.example.demo.model.Movie;
import com.example.demo.model.Showtime;
import com.example.demo.repository.CinemaRepository;
import com.example.demo.repository.MovieRepository;
import com.example.demo.repository.ShowtimeRepository;
import com.example.demo.util.MovieUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShowtimeService {

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final CinemaRepository cinemaRepository;

    public List<Showtime> getAllShowtimes() {
        List<Showtime> showtimes = showtimeRepository.findAll();
        enrichAll(showtimes);
        return showtimes;
    }

    public Optional<Showtime> getShowtimeById(String id) {
        Optional<Showtime> showtimeOpt = showtimeRepository.findById(id);
        showtimeOpt.ifPresent(this::enrich);
        return showtimeOpt;
    }

    // Admin CRUD operations
    @Transactional
    public Showtime createShowtime(Showtime showtime) {
        Movie movie = movieRepository.findById(showtime.getMovieId())
                .orElseThrow(() -> new ResourceNotFoundException("Movie", "id", showtime.getMovieId()));

        Cinema cinema = cinemaRepository.findById(showtime.getCinemaId())
                .orElseThrow(() -> new ResourceNotFoundException("Cinema", "id", showtime.getCinemaId()));

        if (!cinema.hasMovie(showtime.getMovieId())) {
            throw new BadRequestException("Movie does not exist in this cinema");
        }

        // Block showtimes for coming-soon movies
        if (movie.getReleaseDate() != null && !movie.getReleaseDate().isBlank()) {
            try {
                LocalDate releaseDate = LocalDate.parse(movie.getReleaseDate().substring(0, 10));
                if (releaseDate.isAfter(LocalDate.now())) {
                    throw new BadRequestException(
                            "Cannot create showtime for a coming-soon movie. Release date: " + releaseDate);
                }
            } catch (BadRequestException e) {
                throw e;
            } catch (Exception ignored) {
                // If releaseDate format is unparseable, allow it
            }
        }

        showtime.setMovieName(MovieUtils.resolveTitle(movie));
        showtime.setCinemaName(cinema.getName());
        showtime.setCinemaAddress(cinema.getAddress());

        if (showtime.getTotalSeats() <= 0) {
            showtime.setTotalSeats(100);
        }
        if (showtime.getAvailableSeats() <= 0) {
            showtime.setAvailableSeats(showtime.getTotalSeats());
        }
        if (showtime.getPrice() <= 0) {
            showtime.setPrice(80000);
        }
        if (showtime.getRoom() == null || showtime.getRoom().trim().isEmpty()) {
            showtime.setRoom("Room 1");
        }

        return showtimeRepository.save(showtime);
    }

    public List<Showtime> getShowtimesByCinemaAndMovie(String cinemaId, String movieId) {
        List<Showtime> showtimes = showtimeRepository.findByCinemaIdAndMovieId(cinemaId, movieId);
        enrichAll(showtimes);
        return showtimes;
    }

    public List<Showtime> getShowtimesByCinema(String cinemaId) {
        List<Showtime> showtimes = showtimeRepository.findByCinemaId(cinemaId);
        enrichAll(showtimes);
        return showtimes;
    }

    public List<Showtime> getShowtimesByMovie(String movieId) {
        List<Showtime> showtimes = showtimeRepository.findByMovieId(movieId);
        enrichAll(showtimes);
        return showtimes;
    }

    public List<Showtime> getShowtimesByDateAndCinema(String cinemaId, String date) {
        LocalDateTime startOfDay = LocalDateTime.parse(date + "T00:00:00");
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        List<Showtime> filteredShowtimes = showtimeRepository.findByCinemaId(cinemaId).stream()
                .filter(showtime -> {
                    LocalDateTime showtimeDate = showtime.getStartTime();
                    return showtimeDate != null
                            && showtimeDate.isAfter(startOfDay)
                            && showtimeDate.isBefore(endOfDay);
                })
                .toList();

        enrichAll(filteredShowtimes);
        return filteredShowtimes;
    }

    @Transactional
    public Showtime updateShowtime(String showtimeId, Showtime updatedShowtime) {
        Showtime existing = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime", "id", showtimeId));

        if (updatedShowtime.getStartTime() != null) {
            existing.setStartTime(updatedShowtime.getStartTime());
        }
        if (updatedShowtime.getRoom() != null) {
            existing.setRoom(updatedShowtime.getRoom());
        }
        if (updatedShowtime.getTotalSeats() > 0) {
            existing.setTotalSeats(updatedShowtime.getTotalSeats());
        }
        if (updatedShowtime.getAvailableSeats() >= 0) {
            existing.setAvailableSeats(updatedShowtime.getAvailableSeats());
        }
        if (updatedShowtime.getPrice() > 0) {
            existing.setPrice(updatedShowtime.getPrice());
        }

        return showtimeRepository.save(existing);
    }

    @Transactional
    public boolean deleteShowtime(String showtimeId) {
        if (!showtimeRepository.existsById(showtimeId)) {
            throw new ResourceNotFoundException("Showtime", "id", showtimeId);
        }
        showtimeRepository.deleteById(showtimeId);
        return true;
    }

    private void enrich(Showtime showtime) {
        Movie movie = showtime.getMovieId() != null
                ? movieRepository.findById(showtime.getMovieId()).orElse(null)
                : null;

        Cinema cinema = showtime.getCinemaId() != null
                ? cinemaRepository.findById(showtime.getCinemaId()).orElse(null)
                : null;

        ShowtimeMapper.enrich(showtime, movie, cinema);
    }

    private void enrichAll(List<Showtime> showtimes) {
        if (showtimes == null || showtimes.isEmpty()) {
            return;
        }

        List<String> movieIds = showtimes.stream()
                .map(Showtime::getMovieId)
                .filter(id -> id != null && !id.isBlank())
                .distinct()
                .toList();

        List<String> cinemaIds = showtimes.stream()
                .map(Showtime::getCinemaId)
                .filter(id -> id != null && !id.isBlank())
                .distinct()
                .toList();

        Map<String, Movie> movieMap = new HashMap<>();
        if (!movieIds.isEmpty()) {
            movieRepository.findAllById(movieIds).forEach(movie -> {
                if (movie != null && movie.getId() != null) {
                    movieMap.put(movie.getId(), movie);
                }
            });
        }

        Map<String, Cinema> cinemaMap = new HashMap<>();
        if (!cinemaIds.isEmpty()) {
            cinemaRepository.findAllById(cinemaIds).forEach(cinema -> {
                if (cinema != null && cinema.getId() != null) {
                    cinemaMap.put(cinema.getId(), cinema);
                }
            });
        }

        for (Showtime showtime : showtimes) {
            Movie movie = showtime.getMovieId() != null ? movieMap.get(showtime.getMovieId()) : null;
            Cinema cinema = showtime.getCinemaId() != null ? cinemaMap.get(showtime.getCinemaId()) : null;
            ShowtimeMapper.enrich(showtime, movie, cinema);
        }
    }
}
