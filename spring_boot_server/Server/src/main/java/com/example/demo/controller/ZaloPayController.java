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

import com.example.demo.dto.CreateZaloPayResponse;
import com.example.demo.dto.QueryZaloPayResponse;
import com.example.demo.model.ZaloPayOrder;
import com.example.demo.service.ZaloPayService;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/zalopay")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ZaloPayController {

    private final ZaloPayService zaloPayService;
    private final ObjectMapper objectMapper;

    // ---------------------------------------------------------------
    // Create a new ZaloPay payment order
    // POST /api/zalopay/create?user=...&amount=...&description=...
    // ---------------------------------------------------------------
    @PostMapping("/create")
    public ResponseEntity<CreateZaloPayResponse> create(
            @RequestParam String user,
            @RequestParam long amount,
            @RequestParam String description
    ) {
        return ResponseEntity.ok(zaloPayService.createOrder(user, amount, description));
    }

    // ---------------------------------------------------------------
    // Query ZaloPay order status by appTransId
    // GET /api/zalopay/query/{appTransId}
    // ---------------------------------------------------------------
    @GetMapping("/query/{appTransId}")
    public ResponseEntity<QueryZaloPayResponse> query(@PathVariable String appTransId) {
        return ResponseEntity.ok(zaloPayService.queryOrder(appTransId));
    }

    // ---------------------------------------------------------------
    // ZaloPay Callback (Webhook)
    // POST /api/zalopay/webhook
    // ZaloPay sends: { "data": "<json-string>", "mac": "<hmac-sha256>" }
    // MAC is computed using Key2 over the "data" string.
    // Must be publicly accessible (use ngrok in local dev).
    //
    // ZaloPay retry policy:
    //   return_code = 1  → success, ZaloPay stops retrying
    //   return_code = 0  → failure, ZaloPay will retry
    // ---------------------------------------------------------------
    @PostMapping("/webhook")
    public ResponseEntity<Map<String, Object>> webhook(@RequestBody Map<String, Object> payload) {
        log.info("[ZaloPay] Received webhook payload: {}", payload);

        Map<String, Object> result = new HashMap<>();
        String dataJson  = String.valueOf(payload.getOrDefault("data", "{}"));
        String receivedMac = String.valueOf(payload.getOrDefault("mac", ""));

        // 1. Verify MAC using Key2
        boolean valid = zaloPayService.verifyWebhookMac(dataJson, receivedMac);
        if (!valid) {
            log.warn("[ZaloPay] Invalid MAC in webhook");
            result.put("return_code", -1);
            result.put("return_message", "mac invalid");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
        }

        // 2. Parse inner data JSON to extract appTransId
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = objectMapper.readValue(dataJson, Map.class);
            String appTransId = String.valueOf(data.get("app_trans_id"));

            // ZaloPay always sends callback only on success (return_code == 1 in the payload data)
            // If we get a valid MAC, it means the transaction was successful
            zaloPayService.markPaid(appTransId);
            log.info("[ZaloPay] Payment SUCCESS for appTransId={}", appTransId);

            result.put("return_code", 1);
            result.put("return_message", "success");

        } catch (IllegalArgumentException e) {
            // Order not found — return success so ZaloPay stops retrying
            log.warn("[ZaloPay] Order not found during webhook: {}", e.getMessage());
            result.put("return_code", 1);
            result.put("return_message", "order not found but acknowledged");

        } catch (Exception e) {
            log.error("[ZaloPay] Error processing webhook: {}", e.getMessage(), e);
            result.put("return_code", 0);          // 0 = ZaloPay will retry
            result.put("return_message", e.getMessage());
        }

        return ResponseEntity.ok(result);
    }

    // ---------------------------------------------------------------
    // Manual status setters (for admin/testing use)
    // ---------------------------------------------------------------
    @PostMapping("/mark-paid")
    public ResponseEntity<Void> markPaid(@RequestParam String appTransId) {
        zaloPayService.markPaid(appTransId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/mark-expired")
    public ResponseEntity<Void> markExpired(@RequestParam String appTransId) {
        zaloPayService.markExpired(appTransId);
        return ResponseEntity.ok().build();
    }

    // ---------------------------------------------------------------
    // Get all ZaloPay orders (admin)
    // GET /api/zalopay/orders
    // ---------------------------------------------------------------
    @GetMapping("/orders")
    public ResponseEntity<List<ZaloPayOrder>> getAllOrders() {
        return ResponseEntity.ok(zaloPayService.getAllOrders());
    }

    // ---------------------------------------------------------------
    // Cancel a PENDING ZaloPay order when user switches payment method
    // DELETE /api/zalopay/cancel?appTransId=...
    // ---------------------------------------------------------------
    @DeleteMapping("/cancel")
    public ResponseEntity<Void> cancelOrder(@RequestParam String appTransId) {
        try {
            zaloPayService.deleteOrder(appTransId);
        } catch (IllegalStateException | IllegalArgumentException e) {
            log.warn("[ZaloPay] Cancel ignored: {}", e.getMessage());
        }
        return ResponseEntity.ok().build();
    }
}