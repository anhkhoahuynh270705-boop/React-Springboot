package com.example.demo.service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.example.demo.dto.CreateZaloPayResponse;
import com.example.demo.dto.QueryZaloPayResponse;
import com.example.demo.model.ZaloPayOrder;
import com.example.demo.repository.ZaloPayOrderRepository;
import com.example.demo.util.HmacUtils;
import com.example.demo.util.OrderIdGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ZaloPayService {

    private final ZaloPayOrderRepository repo;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${zalopay.app-id}")
    private String appId;

    @Value("${zalopay.key1}")
    private String key1;

    @Value("${zalopay.key2}")
    private String key2;

    @Value("${zalopay.app-user}")
    private String appUser;

    @Value("${zalopay.endpoint}")
    private String endpoint;

    @Value("${zalopay.callback-url}")
    private String callbackUrl;

    @Value("${frontend.url}")
    private String frontendUrl;

    private static final DateTimeFormatter ZP_DATE_FMT =
            DateTimeFormatter.ofPattern("yyMMdd").withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

    // Create Order
    public CreateZaloPayResponse createOrder(String userLabel, long amount, String description) {
        String appTransId = ZP_DATE_FMT.format(Instant.now()) + "_" + OrderIdGenerator.zaloPayOrderId();
        long   appTime    = System.currentTimeMillis();
        String orderInfo  = description != null ? description : "Movie ticket payment";
        String embedData  = "{\"redirecturl\":\"" + frontendUrl + "/payment-result?method=zalopay&appTransId=" + appTransId + "\"}";
        // MAC for create order
        String rawMac = appId + "|" + appTransId + "|" + appUser + "|" + amount
                + "|" + appTime + "|" + embedData + "|[]";
        String mac = HmacUtils.hmacSha256(key1, rawMac);

        // ZaloPay sandbox uses form-encoded POST
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("app_id",       appId);
        form.add("app_trans_id", appTransId);
        form.add("app_user",     appUser);
        form.add("app_time",     String.valueOf(appTime));
        form.add("amount",       String.valueOf(amount));
        form.add("item",         "[]");
        form.add("description",  orderInfo);
        form.add("embed_data",   embedData);
        form.add("callback_url", callbackUrl);
        form.add("mac",          mac);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        String payUrl;
        String qrUrl;

        try {
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    endpoint, new HttpEntity<>(form, headers), Map.class);

            @SuppressWarnings("unchecked")
            Map<String, Object> resp = response.getBody();
            log.info("[ZaloPay] Create order response: {}", resp);

            int returnCode = ((Number) resp.getOrDefault("return_code", -1)).intValue();
            if (returnCode != 1) {
                throw new RuntimeException("ZaloPay API error: " + resp.get("return_message"));
            }

            payUrl = (String) resp.get("order_url");
            qrUrl  = (String) resp.getOrDefault("qr_code", "");
            if (qrUrl == null || qrUrl.isBlank()) {
                qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data="
                        + java.net.URLEncoder.encode(payUrl, java.nio.charset.StandardCharsets.UTF_8);
            }

        } catch (Exception e) {
            log.error("[ZaloPay] Failed to create order via API, falling back. Error: {}", e.getMessage());
            // Fallback for local dev: encode transaction info in the QR
            payUrl = frontendUrl + "/payment/zalopay?appTransId=" + appTransId + "&amount=" + amount;
            qrUrl  = "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data="
                    + java.net.URLEncoder.encode(payUrl, java.nio.charset.StandardCharsets.UTF_8);
        }

        ZaloPayOrder order = new ZaloPayOrder(
                null, appTransId, userLabel, amount, description,
                "PENDING", payUrl, qrUrl, Instant.now(), Instant.now(), null
        );
        repo.save(order);
        return new CreateZaloPayResponse(appTransId, payUrl, qrUrl);
    }

    // Query Order
    public QueryZaloPayResponse queryOrder(String appTransId) {
        ZaloPayOrder order = repo.findByAppTransId(appTransId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + appTransId));
        return new QueryZaloPayResponse(order.getStatus());
    }

    // Webhook (Callback) — verify MAC then mark as PAID / FAILED
    public boolean verifyWebhookMac(String dataJson, String receivedMac) {
        try {
            String computed = HmacUtils.hmacSha256(key2, dataJson);
            log.info("[ZaloPay] Webhook verify — computed={}, received={}", computed, receivedMac);
            return computed.equals(receivedMac);
        } catch (Exception e) {
            log.error("[ZaloPay] MAC verification failed", e);
            return false;
        }
    }

    // Status transitions
    public void markPaid(String appTransId) {
        ZaloPayOrder order = repo.findByAppTransId(appTransId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + appTransId));
        order.setStatus("PAID");
        order.setPaidAt(Instant.now());
        order.setUpdatedAt(Instant.now());
        repo.save(order);
        log.info("[ZaloPay] Order {} marked as PAID", appTransId);
    }

    public void markFailed(String appTransId) {
        ZaloPayOrder order = repo.findByAppTransId(appTransId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + appTransId));
        order.setStatus("FAILED");
        order.setUpdatedAt(Instant.now());
        repo.save(order);
        log.info("[ZaloPay] Order {} marked as FAILED", appTransId);
    }

    public void markExpired(String appTransId) {
        ZaloPayOrder order = repo.findByAppTransId(appTransId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + appTransId));
        order.setStatus("EXPIRED");
        order.setUpdatedAt(Instant.now());
        repo.save(order);
        log.info("[ZaloPay] Order {} marked as EXPIRED", appTransId);
    }

    public List<ZaloPayOrder> getAllOrders() {
        return repo.findAll();
    }

    public void deleteOrder(String appTransId) {
        ZaloPayOrder order = repo.findByAppTransId(appTransId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + appTransId));
        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalStateException("Cannot cancel an order that is not PENDING");
        }
        repo.delete(order);
        log.info("[ZaloPay] Order {} cancelled", appTransId);
    }
}