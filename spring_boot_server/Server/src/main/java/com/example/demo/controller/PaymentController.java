package com.example.demo.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.CreateOrderRequest;
import com.example.demo.dto.CreateOrderResponse;
import com.example.demo.dto.VerifyResponse;
import com.example.demo.model.PaymentOrder;
import com.example.demo.service.PaymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PaymentController {

  private final PaymentService paymentService;

  @GetMapping("/orders")
  public ResponseEntity<List<PaymentOrder>> getAllOrders() {
    try {
        List<PaymentOrder> orders = paymentService.getAllOrders();
        return ResponseEntity.ok(orders);
    } catch (Exception e) {
        return ResponseEntity.status(500).body(new ArrayList<>());
    }
  }
  
  // Create a new payment order
  @PostMapping("/create-order")
  public CreateOrderResponse createOrder(@RequestBody CreateOrderRequest req) {
    return paymentService.createOrder(req);
  }

  @GetMapping("/verify")
  public VerifyResponse verify(@RequestParam String orderId) {
    return paymentService.verify(orderId);
  }

  // For admin/webhook to confirm payment
  @PostMapping("/mark-paid")
  public VerifyResponse markPaid(@RequestParam String orderId) {
    return paymentService.markPaid(orderId);
  }

  @PostMapping("/mark-expired")
  public VerifyResponse markExpired(@RequestParam String orderId) {
    return paymentService.markExpired(orderId);
  }

  // Cancel (delete) a pending VietQR order when user switches payment method
  @DeleteMapping("/cancel")
  public ResponseEntity<Void> cancelOrder(@RequestParam String orderId) {
    try {
      paymentService.deleteOrder(orderId);
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