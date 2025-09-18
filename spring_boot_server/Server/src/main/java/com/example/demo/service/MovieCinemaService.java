package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.Cinema;
import com.example.demo.model.Movie;
import com.example.demo.repository.CinemaRepository;
import com.example.demo.repository.MovieRepository;

@Service
public class MovieCinemaService {
    
    @Autowired
    private MovieRepository movieRepository;
    
    @Autowired
    private CinemaRepository cinemaRepository;
    
    /**
     * Thêm phim vào rạp chiếu - đồng bộ hóa hai chiều
     */
    @Transactional
    public boolean addMovieToCinema(String movieId, String cinemaId) {
        try {
            Optional<Movie> movieOpt = movieRepository.findById(movieId);
            Optional<Cinema> cinemaOpt = cinemaRepository.findById(cinemaId);
            
            if (movieOpt.isPresent() && cinemaOpt.isPresent()) {
                Movie movie = movieOpt.get();
                Cinema cinema = cinemaOpt.get();
                
                // Thêm cinemaId vào movie
                movie.addCinema(cinemaId);
                movieRepository.save(movie);
                
                // Thêm movieId vào cinema
                cinema.addMovie(movieId);
                cinemaRepository.save(cinema);
                
                return true;
            }
            return false;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi thêm phim vào rạp chiếu: " + e.getMessage());
        }
    }
    
    /**
     * Xóa phim khỏi rạp chiếu - đồng bộ hóa hai chiều
     */
    @Transactional
    public boolean removeMovieFromCinema(String movieId, String cinemaId) {
        try {
            Optional<Movie> movieOpt = movieRepository.findById(movieId);
            Optional<Cinema> cinemaOpt = cinemaRepository.findById(cinemaId);
            
            if (movieOpt.isPresent() && cinemaOpt.isPresent()) {
                Movie movie = movieOpt.get();
                Cinema cinema = cinemaOpt.get();
                
                // Xóa cinemaId khỏi movie
                movie.removeCinema(cinemaId);
                movieRepository.save(movie);
                
                // Xóa movieId khỏi cinema
                cinema.removeMovie(movieId);
                cinemaRepository.save(cinema);
                
                return true;
            }
            return false;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xóa phim khỏi rạp chiếu: " + e.getMessage());
        }
    }
    
    /**
     * Lấy danh sách phim theo rạp chiếu
     */
    public List<Movie> getMoviesByCinema(String cinemaId) {
        try {
            List<Movie> allMovies = movieRepository.findAll();
            return allMovies.stream()
                .filter(movie -> movie.getCinemaIds() != null && movie.getCinemaIds().contains(cinemaId))
                .toList();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy danh sách phim theo rạp chiếu: " + e.getMessage());
        }
    }
    
    /**
     * Lấy danh sách rạp chiếu theo phim
     */
    public List<Cinema> getCinemasByMovie(String movieId) {
        try {
            return cinemaRepository.findByMovieIdsContaining(movieId);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy danh sách rạp chiếu theo phim: " + e.getMessage());
        }
    }
    
    /**
     * Kiểm tra phim có trong rạp chiếu không
     */
    public boolean isMovieInCinema(String movieId, String cinemaId) {
        try {
            Optional<Movie> movieOpt = movieRepository.findById(movieId);
            if (movieOpt.isPresent()) {
                Movie movie = movieOpt.get();
                return movie.hasCinema(cinemaId);
            }
            return false;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi kiểm tra phim trong rạp chiếu: " + e.getMessage());
        }
    }
}
