package com.example.demo.controller;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.SeatLayout;
import com.example.demo.repository.SeatLayoutRepository;

import lombok.RequiredArgsConstructor;
@RestController
@RequestMapping("/api/seat-layouts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SeatLayoutController {

    private final SeatLayoutRepository seatLayoutRepository;

    @GetMapping
    public List<SeatLayout> getAllLayouts() {
        return seatLayoutRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SeatLayout> getLayoutById(@PathVariable String id) {
        return seatLayoutRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public SeatLayout createLayout(@RequestBody SeatLayout layout) {
        return seatLayoutRepository.save(layout);
    }
}
