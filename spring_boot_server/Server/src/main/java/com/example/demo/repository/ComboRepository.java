package com.example.demo.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Combo;

@Repository
public interface ComboRepository extends MongoRepository<Combo, String> {

    List<Combo> findByIsActiveTrue();
    List<Combo> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);

    @Query("{'isActive': true, 'price': {$gte: ?0, $lte: ?1}}")
    List<Combo> findByPriceRangeAndIsActiveTrue(BigDecimal minPrice, BigDecimal maxPrice);

    @Query("{'isActive': true, 'price': {$lte: ?0}}")
    List<Combo> findByMaxPriceAndIsActiveTrue(BigDecimal maxPrice);
}
