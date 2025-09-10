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

@RestController
@RequestMapping("/api/showtimes")
@CrossOrigin(origins = "*")
public class ShowtimeController {
    @Autowired
    private ShowtimeRepository showtimeRepository;
    
    @Autowired
    private MovieRepository movieRepository;

    @GetMapping
    public List<Showtime> getAllShowtimes() {
        List<Showtime> showtimes = showtimeRepository.findAll();
        
        // Populate movieName for each showtime
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

    @GetMapping("/{id}")
    public Optional<Showtime> getShowtimeById(@PathVariable String id) {
        return showtimeRepository.findById(id);
    }

    @PostMapping
    public Showtime createShowtime(@RequestBody Showtime showtime) {
        return showtimeRepository.save(showtime);
    }

    @PutMapping("/{id}")
    public Showtime updateShowtime(@PathVariable String id, @RequestBody Showtime showtime) {
        showtime.setId(id);
        return showtimeRepository.save(showtime);
    }

    @DeleteMapping("/{id}")
    public void deleteShowtime(@PathVariable String id) {
        showtimeRepository.deleteById(id);
    }
}
