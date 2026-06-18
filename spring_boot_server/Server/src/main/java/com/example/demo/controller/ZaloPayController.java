package com.example.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.CreateZaloPayResponse;
import com.example.demo.dto.QueryZaloPayResponse;
import com.example.demo.model.ZaloPayOrder;
import com.example.demo.service.ZaloPayService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/zalopay")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ZaloPayController {
	
	private final ZaloPayService zaloPayService;

	// Create a new ZaloPay order
	@PostMapping("/create")
	public ResponseEntity<CreateZaloPayResponse> create(
		@RequestParam String user,
		@RequestParam long amount,
		@RequestParam String description
	) {
		return ResponseEntity.ok(zaloPayService.createOrder(user, amount, description));
	}

	// Query ZaloPay order status
	@GetMapping("/query/{appTransId}")
	public ResponseEntity<QueryZaloPayResponse> query(@PathVariable String appTransId) {
		return ResponseEntity.ok(zaloPayService.queryOrder(appTransId));
	}

	// Mark ZaloPay order as paid
	@PostMapping("/mark-paid")
	public ResponseEntity<Void> markPaid(@RequestParam String appTransId) {
		zaloPayService.markPaid(appTransId);
		return ResponseEntity.ok().build();
	}

	// Mark ZaloPay order as expired
	@PostMapping("/mark-expired")
	public ResponseEntity<Void> markExpired(@RequestParam String appTransId) {
		zaloPayService.markExpired(appTransId);
		return ResponseEntity.ok().build();
	}

	// Get all ZaloPay orders
	@GetMapping("/orders")
	public ResponseEntity<List<ZaloPayOrder>> getAllOrders() {
		return ResponseEntity.ok(zaloPayService.getAllOrders());
	}

	// Cancel (delete) a pending ZaloPay order when user switches payment method
	@DeleteMapping("/cancel")
	public ResponseEntity<Void> cancelOrder(@RequestParam String appTransId) {
		try {
			zaloPayService.deleteOrder(appTransId);
			return ResponseEntity.ok().build();
		} catch (IllegalStateException e) {
			// Order already paid – silently ignore
			return ResponseEntity.ok().build();
		} catch (IllegalArgumentException e) {
			// Order not found – treat as already cleaned up
			return ResponseEntity.ok().build();
		}
	}
}