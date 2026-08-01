package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.Cinema;
import com.example.demo.model.Movie;
import com.example.demo.repository.CinemaRepository;
import com.example.demo.repository.MovieRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MovieCinemaService {

    private final MovieRepository movieRepository;

    private final CinemaRepository cinemaRepository;
    
    // Add other necessary services or repositories if needed
    @Transactional
    public boolean addMovieToCinema(String movieId, String cinemaId) {
        try {
            Optional<Movie> movieOpt = movieRepository.findById(movieId);
            Optional<Cinema> cinemaOpt = cinemaRepository.findById(cinemaId);
            
            if (movieOpt.isPresent() && cinemaOpt.isPresent()) {
                Movie movie = movieOpt.get();
                Cinema cinema = cinemaOpt.get();
                
                // Add cinemaId to movie
                movie.addCinema(cinemaId);
                movieRepository.save(movie);
                
                // Add movieId to cinema
                cinema.addMovie(movieId);
                cinemaRepository.save(cinema);
                
                return true;
            }
            return false;
        } catch (Exception e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }
    
    // Delete movie from cinema
    @Transactional
    public boolean removeMovieFromCinema(String movieId, String cinemaId) {
        try {
            Optional<Movie> movieOpt = movieRepository.findById(movieId);
            Optional<Cinema> cinemaOpt = cinemaRepository.findById(cinemaId);
            
            if (movieOpt.isPresent() && cinemaOpt.isPresent()) {
                Movie movie = movieOpt.get();
                Cinema cinema = cinemaOpt.get();
                
                // Delete cinemaId  from movie  
                movie.removeCinema(cinemaId);
                movieRepository.save(movie);
                
                // Delete movieId from cinema
                cinema.removeMovie(movieId);
                cinemaRepository.save(cinema);
                
                return true;
            }
            return false;
        } catch (Exception e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }
    
    // Get movies by cinema — push filter to MongoDB, not Java
    public List<Movie> getMoviesByCinema(String cinemaId) {
        try {
            return movieRepository.findByCinemaIdsContaining(cinemaId);
        } catch (Exception e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }

    
    // Get cinemas by movie

    public List<Cinema> getCinemasByMovie(String movieId) {
        try {
            return cinemaRepository.findByMovieIdsContaining(movieId);
        } catch (Exception e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }
    
    // Check if movie is in cinema

    public boolean isMovieInCinema(String movieId, String cinemaId) {
        try {
            Optional<Movie> movieOpt = movieRepository.findById(movieId);
            if (movieOpt.isPresent()) {
                Movie movie = movieOpt.get();
                return movie.hasCinema(cinemaId);
            }
            return false;
        } catch (Exception e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }
}
