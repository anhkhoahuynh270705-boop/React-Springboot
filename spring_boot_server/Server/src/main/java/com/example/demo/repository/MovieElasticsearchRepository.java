package com.example.demo.repository;

import com.example.demo.model.MovieIndex;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MovieElasticsearchRepository extends ElasticsearchRepository<MovieIndex, String> {
    
    // Find movies using standard Spring Data query derivation with accentless support
    List<MovieIndex> findByTitleContainingIgnoreCaseOrTitleNoSignContainingIgnoreCaseOrDirectorContainingIgnoreCaseOrDirectorNoSignContainingIgnoreCaseOrActorsContainingIgnoreCaseOrActorsNoSignContainingIgnoreCase(
        String title, String titleNoSign, String director, String directorNoSign, String actors, String actorsNoSign
    );
}
