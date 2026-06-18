package com.example.demo.util;

import com.example.demo.model.Movie;

public final class MovieUtils {

    private MovieUtils() {}

    public static String resolveTitle(Movie movie) {
        if (movie == null) {
            return "Unknown Movie";
        }
        if (movie.getTitle() != null && !movie.getTitle().trim().isEmpty()) {
            return movie.getTitle();
        }
        if (movie.getName() != null && !movie.getName().trim().isEmpty()) {
            return movie.getName();
        }
        if (movie.getMovieName() != null && !movie.getMovieName().trim().isEmpty()) {
            return movie.getMovieName();
        }
        if (movie.getEnglishTitle() != null && !movie.getEnglishTitle().trim().isEmpty()) {
            return movie.getEnglishTitle();
        }
        return "Unknown Movie";
    }
}
