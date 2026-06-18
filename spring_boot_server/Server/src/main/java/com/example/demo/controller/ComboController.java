package com.example.demo.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
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

import com.example.demo.model.Combo;
import com.example.demo.service.ComboService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/combos")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ComboController {

    private final ComboService comboService;
    
    // Get all active combos
    @GetMapping
    public ResponseEntity<List<Combo>> getAllActiveCombos() {
        List<Combo> combos = comboService.getAllActiveCombos();
        return ResponseEntity.ok(combos);
    }
    
    // Get all combos (Admin)
    @GetMapping("/all")
    public ResponseEntity<List<Combo>> getAllCombos() {
        List<Combo> combos = comboService.getAllCombos();
        return ResponseEntity.ok(combos);
    }
    
    // Get combo by ID
    @GetMapping("/{id}")
    public ResponseEntity<Combo> getComboById(@PathVariable String id) {
        Optional<Combo> combo = comboService.getComboById(id);
        if (combo.isPresent()) {
            return ResponseEntity.ok(combo.get());
        }
        return ResponseEntity.notFound().build();
    }
    
    // Search combos by name
    @GetMapping("/search")
    public ResponseEntity<List<Combo>> searchCombosByName(@RequestParam String name) {
        List<Combo> combos = comboService.searchCombosByName(name);
        return ResponseEntity.ok(combos);
    }
    
    // Search combos by price range
    @GetMapping("/price-range")
    public ResponseEntity<List<Combo>> getCombosByPriceRange(
            @RequestParam BigDecimal minPrice, 
            @RequestParam BigDecimal maxPrice) {
        List<Combo> combos = comboService.getCombosByPriceRange(minPrice, maxPrice);
        return ResponseEntity.ok(combos);
    }
    
    // Search combos by maximum price
    @GetMapping("/max-price")
    public ResponseEntity<List<Combo>> getCombosByMaxPrice(@RequestParam BigDecimal maxPrice) {
        List<Combo> combos = comboService.getCombosByMaxPrice(maxPrice);
        return ResponseEntity.ok(combos);
    }
    
    // Create new combo (Admin)
    @PostMapping
    public ResponseEntity<Combo> createCombo(@RequestBody Combo combo) {
        Combo createdCombo = comboService.createCombo(combo);
        return ResponseEntity.ok(createdCombo);
    }
    
    // Update combo (Admin)
    @PutMapping("/{id}")
    public ResponseEntity<Combo> updateCombo(@PathVariable String id, @RequestBody Combo comboDetails) {
        Combo updatedCombo = comboService.updateCombo(id, comboDetails);
        if (updatedCombo != null) {
            return ResponseEntity.ok(updatedCombo);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Delete combo (Admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCombo(@PathVariable String id) {
        boolean deleted = comboService.deleteCombo(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
