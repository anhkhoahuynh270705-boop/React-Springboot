package com.example.demo.mapper;

import com.example.demo.model.Cinema;
import com.example.demo.model.Movie;
import com.example.demo.model.Showtime;
import com.example.demo.util.MovieUtils;

public final class ShowtimeMapper {

    private ShowtimeMapper() {}

    public static void enrich(Showtime showtime, Movie movie, Cinema cinema) {
        // Populate movie name
        if (movie != null) {
            showtime.setMovieName(MovieUtils.resolveTitle(movie));
        } else {
            showtime.setMovieName(
                    showtime.getMovieId() != null ? "Movie Not Found" : "No Movie ID"
            );
        }

        // Populate cinema name and address
        if (cinema != null) {
            showtime.setCinemaName(cinema.getName());
            showtime.setCinemaAddress(cinema.getAddress());
        }

        // Fallback defaults
        if (showtime.getCinemaName() == null || showtime.getCinemaName().isBlank()) {
            showtime.setCinemaName("Galaxy Studio");
        }
        if (showtime.getCinemaAddress() == null || showtime.getCinemaAddress().isBlank()) {
            showtime.setCinemaAddress("");
        }
    }
}
