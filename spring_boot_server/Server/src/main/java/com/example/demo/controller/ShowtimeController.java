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

import com.example.demo.model.Showtime;
import com.example.demo.model.Movie;
import com.example.demo.repository.ShowtimeRepository;
import com.example.demo.repository.MovieRepository;
import com.example.demo.service.ShowtimeService;

@RestController
@RequestMapping("/api/showtimes")
@CrossOrigin(origins = "*")
public class ShowtimeController {
    @Autowired
    private ShowtimeRepository showtimeRepository;
    
    @Autowired
    private MovieRepository movieRepository;
    
    @Autowired
    private ShowtimeService showtimeService;

    @GetMapping
    public List<Showtime> getAllShowtimes() {
        List<Showtime> showtimes = showtimeRepository.findAll();
        
        for (Showtime showtime : showtimes) {
            if (showtime.getMovieId() != null) {
                Optional<Movie> movie = movieRepository.findById(showtime.getMovieId());
                if (movie.isPresent()) {
                    Movie movieData = movie.get();
                    // Set movieName from various possible fields
                    String movieName = movieData.getTitle() != null ? movieData.getTitle() :
                                     movieData.getName() != null ? movieData.getName() :
                                     movieData.getMovieName() != null ? movieData.getMovieName() :
                                     movieData.getEnglishTitle() != null ? movieData.getEnglishTitle() :
                                     "Unknown Movie";
                    showtime.setMovieName(movieName);
                } else {
                    showtime.setMovieName("Movie Not Found");
                }
            } else {
                showtime.setMovieName("No Movie ID");
            }
            
            // Set default cinema info if not present
            if (showtime.getCinemaName() == null || showtime.getCinemaName().trim().isEmpty()) {
                showtime.setCinemaName("Galaxy Studio");
            }
            if (showtime.getCinemaAddress() == null || showtime.getCinemaAddress().trim().isEmpty()) {
                showtime.setCinemaAddress("123 Đường ABC, Quận 1, TP.HCM");
            }
        }
        
        return showtimes;
    }

    // Thêm endpoint để lấy showtimes theo movieId
    @GetMapping("/movie/{movieId}")
    public List<Showtime> getShowtimesByMovieId(@PathVariable String movieId) {
        return showtimeRepository.findByMovieId(movieId);
    }

    // Thêm endpoint để lấy showtimes theo query parameter
    @GetMapping(params = "movieId")
    public List<Showtime> getShowtimesByMovieIdParam(@RequestParam String movieId) {
        return showtimeRepository.findByMovieId(movieId);
    }
    
    // Lấy showtimes theo rạp chiếu
    @GetMapping("/cinema/{cinemaId}")
    public List<Showtime> getShowtimesByCinemaId(@PathVariable String cinemaId) {
        List<Showtime> showtimes = showtimeRepository.findByCinemaId(cinemaId);
        
        for (Showtime showtime : showtimes) {
            if (showtime.getMovieId() != null) {
                Optional<Movie> movie = movieRepository.findById(showtime.getMovieId());
                if (movie.isPresent()) {
                    Movie movieData = movie.get();
                    String movieName = movieData.getTitle() != null ? movieData.getTitle() :
                                     movieData.getName() != null ? movieData.getName() :
                                     movieData.getMovieName() != null ? movieData.getMovieName() :
                                     movieData.getEnglishTitle() != null ? movieData.getEnglishTitle() :
                                     "Unknown Movie";
                    showtime.setMovieName(movieName);
                } else {
                    showtime.setMovieName("Movie Not Found");
                }
            } else {
                showtime.setMovieName("No Movie ID");
            }
        }
        
        return showtimes;
    }
    
    // Lấy showtimes theo rạp và phim
    @GetMapping("/cinema/{cinemaId}/movie/{movieId}")
    public List<Showtime> getShowtimesByCinemaAndMovie(@PathVariable String cinemaId, @PathVariable String movieId) {
        return showtimeService.getShowtimesByCinemaAndMovie(cinemaId, movieId);
    }
    
    // Lấy showtimes theo ngày và rạp chiếu
    @GetMapping("/cinema/{cinemaId}/date/{date}")
    public List<Showtime> getShowtimesByDateAndCinema(@PathVariable String cinemaId, @PathVariable String date) {
        return showtimeService.getShowtimesByDateAndCinema(cinemaId, date);
    }

    @GetMapping("/{id}")
    public Optional<Showtime> getShowtimeById(@PathVariable String id) {
        return showtimeRepository.findById(id);
    }

    @PostMapping
    public Showtime createShowtime(@RequestBody Showtime showtime) {
        return showtimeService.createShowtime(showtime);
    }

    @PutMapping("/{id}")
    public Showtime updateShowtime(@PathVariable String id, @RequestBody Showtime showtime) {
        return showtimeService.updateShowtime(id, showtime);
    }

    @DeleteMapping("/{id}")
    public boolean deleteShowtime(@PathVariable String id) {
        return showtimeService.deleteShowtime(id);
    }
}
