package com.example.demo.repository;

import com.example.demo.model.MovieIndex;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieElasticsearchRepository extends ElasticsearchRepository<MovieIndex, String> {
    // Search logic handled via ElasticsearchOperations DSL (Multi match, bool
    // query, fuzziness, prefixLength)
}
