package com.example.demo.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.model.Combo;
import com.example.demo.repository.ComboRepository;

import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class ComboService {
    
    private final ComboRepository comboRepository;

    public List<Combo> getAllActiveCombos() {
        return comboRepository.findByIsActiveTrue();
    }

    public List<Combo> getAllCombos() {
        return comboRepository.findAll();
    }

    public Optional<Combo> getComboById(String id) {
        return comboRepository.findById(id);
    }

    public List<Combo> searchCombosByName(String name) {
        return comboRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(name);
    }

    public List<Combo> getCombosByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return comboRepository.findByPriceRangeAndIsActiveTrue(minPrice, maxPrice);
    }

    public List<Combo> getCombosByMaxPrice(BigDecimal maxPrice) {
        return comboRepository.findByMaxPriceAndIsActiveTrue(maxPrice);
    }

    public Combo createCombo(Combo combo) {
        return comboRepository.save(combo);
    }

    public Combo updateCombo(String id, Combo comboDetails) {
        Optional<Combo> optionalCombo = comboRepository.findById(id);
        if (optionalCombo.isPresent()) {
            Combo combo = optionalCombo.get();
            combo.setName(comboDetails.getName());
            combo.setDescription(comboDetails.getDescription());
            combo.setPrice(comboDetails.getPrice());
            combo.setImageUrl(comboDetails.getImageUrl());
            combo.setItems(comboDetails.getItems());
            combo.setIsActive(comboDetails.getIsActive());
            return comboRepository.save(combo);
        }
        return null;
    }

    public boolean deleteCombo(String id) {
        if (comboRepository.existsById(id)) {
            comboRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
