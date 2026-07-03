package com.example.demo.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.CreateMoMoResponse;
import com.example.demo.dto.QueryMoMoResponse;
import com.example.demo.model.MoMoOrder;
import com.example.demo.service.MoMoService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/momo")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MoMoController {

    private final MoMoService moMoService;

    // Create a new MoMo payment order
    @PostMapping("/create")
    public ResponseEntity<CreateMoMoResponse> create(
            @RequestParam String user,
            @RequestParam long amount,
            @RequestParam String description) {
        return ResponseEntity.ok(moMoService.createOrder(user, amount, description));
    }

    @GetMapping("/query/{orderId}")
    public ResponseEntity<QueryMoMoResponse> query(@PathVariable String orderId) {
        return ResponseEntity.ok(moMoService.queryOrder(orderId));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Map<String, Object>> webhook(@RequestBody Map<String, Object> payload) {
        log.info("[MoMo] Received webhook payload: {}", payload);

        String orderId = String.valueOf(payload.getOrDefault("orderId", ""));
        String signature = String.valueOf(payload.getOrDefault("signature", ""));
        int resultCode = ((Number) payload.getOrDefault("resultCode", -1)).intValue();

        // 1. Verify signature to ensure the request actually came from MoMo
        boolean valid = moMoService.verifyWebhookSignature(payload, signature);
        if (!valid) {
            log.warn("[MoMo] Invalid webhook signature for orderId={}", orderId);
            Map<String, Object> error = new HashMap<>();
            error.put("resultCode", 1);
            error.put("message", "Invalid signature");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        // 2. Update order status based on MoMo result code
        try {
            if (resultCode == 0) {
                moMoService.markPaid(orderId);
                log.info("[MoMo] Payment SUCCESS for orderId={}", orderId);
            } else {
                moMoService.markFailed(orderId);
                log.info("[MoMo] Payment FAILED (resultCode={}) for orderId={}", resultCode, orderId);
            }
        } catch (IllegalArgumentException e) {
            log.warn("[MoMo] Order not found during webhook: {}", orderId);
        }

        // 3. Respond to MoMo to acknowledge receipt (MoMo expects resultCode=0 in
        // response)
        Map<String, Object> ack = new HashMap<>();
        ack.put("partnerCode", payload.getOrDefault("partnerCode", ""));
        ack.put("requestId", payload.getOrDefault("requestId", ""));
        ack.put("orderId", orderId);
        ack.put("resultCode", 0);
        ack.put("message", "Acknowledged");
        return ResponseEntity.ok(ack);
    }

    @PostMapping("/mark-paid")
    public ResponseEntity<Void> markPaid(@RequestParam String orderId) {
        moMoService.markPaid(orderId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/mark-expired")
    public ResponseEntity<Void> markExpired(@RequestParam String orderId) {
        moMoService.markExpired(orderId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/orders")
    public ResponseEntity<List<MoMoOrder>> getAllOrders() {
        return ResponseEntity.ok(moMoService.getAllOrders());
    }

    @DeleteMapping("/cancel")
    public ResponseEntity<Void> cancelOrder(@RequestParam String orderId) {
        try {
            moMoService.deleteOrder(orderId);
        } catch (IllegalStateException | IllegalArgumentException e) {
            log.warn("[MoMo] Cancel ignored: {}", e.getMessage());
        }
        return ResponseEntity.ok().build();
    }
}
