package com.example.demo.controller;

import com.example.demo.model.Combo;
import com.example.demo.service.ComboService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/combos")
@CrossOrigin(origins = "*")
public class ComboController {
    
    @Autowired
    private ComboService comboService;
    
    // Lấy tất cả combo đang hoạt động
    @GetMapping
    public ResponseEntity<List<Combo>> getAllActiveCombos() {
        List<Combo> combos = comboService.getAllActiveCombos();
        return ResponseEntity.ok(combos);
    }
    
    // Lấy combo theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Combo> getComboById(@PathVariable String id) {
        Optional<Combo> combo = comboService.getComboById(id);
        if (combo.isPresent()) {
            return ResponseEntity.ok(combo.get());
        }
        return ResponseEntity.notFound().build();
    }
    
    // Tìm kiếm combo theo tên
    @GetMapping("/search")
    public ResponseEntity<List<Combo>> searchCombosByName(@RequestParam String name) {
        List<Combo> combos = comboService.searchCombosByName(name);
        return ResponseEntity.ok(combos);
    }
    
    // Tìm combo theo khoảng giá
    @GetMapping("/price-range")
    public ResponseEntity<List<Combo>> getCombosByPriceRange(
            @RequestParam BigDecimal minPrice, 
            @RequestParam BigDecimal maxPrice) {
        List<Combo> combos = comboService.getCombosByPriceRange(minPrice, maxPrice);
        return ResponseEntity.ok(combos);
    }
    
    // Tìm combo theo giá tối đa
    @GetMapping("/max-price")
    public ResponseEntity<List<Combo>> getCombosByMaxPrice(@RequestParam BigDecimal maxPrice) {
        List<Combo> combos = comboService.getCombosByMaxPrice(maxPrice);
        return ResponseEntity.ok(combos);
    }
    
    // Tạo combo mới (Admin)
    @PostMapping
    public ResponseEntity<Combo> createCombo(@RequestBody Combo combo) {
        Combo createdCombo = comboService.createCombo(combo);
        return ResponseEntity.ok(createdCombo);
    }
    
    // Cập nhật combo (Admin)
    @PutMapping("/{id}")
    public ResponseEntity<Combo> updateCombo(@PathVariable String id, @RequestBody Combo comboDetails) {
        Combo updatedCombo = comboService.updateCombo(id, comboDetails);
        if (updatedCombo != null) {
            return ResponseEntity.ok(updatedCombo);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Xóa combo (Admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCombo(@PathVariable String id) {
        boolean deleted = comboService.deleteCombo(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
