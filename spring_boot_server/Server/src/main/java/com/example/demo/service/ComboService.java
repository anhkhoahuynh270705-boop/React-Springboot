package com.example.demo.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Combo;
import com.example.demo.repository.ComboRepository;

@Service
public class ComboService {
    
    @Autowired
    private ComboRepository comboRepository;
    
    // Lấy tất cả combo đang hoạt động
    public List<Combo> getAllActiveCombos() {
        return comboRepository.findByIsActiveTrue();
    }
    
    // Lấy combo theo ID
    public Optional<Combo> getComboById(String id) {
        return comboRepository.findById(id);
    }
    
    // Tìm kiếm combo theo tên
    public List<Combo> searchCombosByName(String name) {
        return comboRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(name);
    }
    
    // Tìm combo theo khoảng giá
    public List<Combo> getCombosByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return comboRepository.findByPriceRangeAndIsActiveTrue(minPrice, maxPrice);
    }
    
    // Tìm combo theo giá tối đa
    public List<Combo> getCombosByMaxPrice(BigDecimal maxPrice) {
        return comboRepository.findByMaxPriceAndIsActiveTrue(maxPrice);
    }
    
    // Tạo combo mới (Admin)
    public Combo createCombo(Combo combo) {
        return comboRepository.save(combo);
    }
    
    // Cập nhật combo (Admin)
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
    
    // Xóa combo (Admin)
    public boolean deleteCombo(String id) {
        Optional<Combo> optionalCombo = comboRepository.findById(id);
        if (optionalCombo.isPresent()) {
            Combo combo = optionalCombo.get();
            combo.setIsActive(false);
            comboRepository.save(combo);
            return true;
        }
        return false;
    }
}
