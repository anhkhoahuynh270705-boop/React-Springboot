package com.example.demo.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.demo.dto.CreateMoMoResponse;
import com.example.demo.dto.QueryMoMoResponse;
import com.example.demo.model.MoMoOrder;
import com.example.demo.repository.MoMoOrderRepository;
import com.example.demo.util.HmacUtils;
import com.example.demo.util.OrderIdGenerator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MoMoService {

    private final MoMoOrderRepository repo;
    private final RestTemplate restTemplate;

    @Value("${momo.partner-code}")
    private String partnerCode;

    @Value("${momo.access-key}")
    private String accessKey;

    @Value("${momo.secret-key}")
    private String secretKey;

    @Value("${momo.endpoint}")
    private String endpoint;

    @Value("${momo.ipn-url}")
    private String ipnUrl;

    @Value("${frontend.url}")
    private String frontendUrl;

    // Create Order — calls real MoMo API and saves pending order to DB
    public CreateMoMoResponse createOrder(String userLabel, long amount, String description) {
        String orderId    = OrderIdGenerator.momoOrderId();
        String requestId  = UUID.randomUUID().toString();
        String orderInfo  = description != null ? description : "Movie ticket payment";
        String redirectUrl = frontendUrl + "/payment-result?method=momo&orderId=" + orderId;
        String extraData  = "";
        String requestType = "payWithMethod";

        // Build raw signature string
        String rawSignature = "accessKey=" + accessKey
                + "&amount=" + amount
                + "&extraData=" + extraData
                + "&ipnUrl=" + ipnUrl
                + "&orderId=" + orderId
                + "&orderInfo=" + orderInfo
                + "&partnerCode=" + partnerCode
                + "&redirectUrl=" + redirectUrl
                + "&requestId=" + requestId
                + "&requestType=" + requestType;

        String signature = HmacUtils.hmacSha256(secretKey, rawSignature);

        // Build request body
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("partnerCode", partnerCode);
        body.put("requestId", requestId);
        body.put("amount", amount);
        body.put("orderId", orderId);
        body.put("orderInfo", orderInfo);
        body.put("redirectUrl", redirectUrl);
        body.put("ipnUrl", ipnUrl);
        body.put("lang", "vi");
        body.put("requestType", requestType);
        body.put("autoCapture", true);
        body.put("extraData", extraData);
        body.put("signature", signature);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String payUrl;
        String qrCodeUrl;

        try {
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    endpoint, new HttpEntity<>(body, headers), Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> resp = response.getBody();
            log.info("[MoMo] Create order response: {}", resp);

            int resultCode = ((Number) resp.getOrDefault("resultCode", -1)).intValue();
            if (resultCode != 0) {
                throw new RuntimeException("MoMo API error: " + resp.get("message"));
            }

            payUrl    = (String) resp.get("payUrl");
            qrCodeUrl = (String) resp.getOrDefault("qrCodeUrl", "");

        } catch (Exception e) {
            log.error("[MoMo] Failed to create order via API, falling back to sandbox URL. Error: {}", e.getMessage());
            // Use Url for fallback
            payUrl = frontendUrl + "/payment/momo?orderId=" + orderId + "&amount=" + amount;
            qrCodeUrl = "";
        }

        // generate a QR image from the payUrl with MoMo logo in the center
        if (qrCodeUrl == null || qrCodeUrl.isBlank()) {
            String logoUrl = "https://img.mservice.io/momo-payment/icon/images/logo512.png";
            qrCodeUrl = "https://quickchart.io/qr?size=300&ecLevel=H"
                    + "&centerImageUrl=" + URLEncoder.encode(logoUrl, StandardCharsets.UTF_8)
                    + "&text=" + URLEncoder.encode(payUrl, StandardCharsets.UTF_8);
        }

        MoMoOrder order = new MoMoOrder(
                null, orderId, userLabel, amount, description,
                "PENDING", payUrl, qrCodeUrl, Instant.now(), Instant.now(), null
        );
        repo.save(order);
        return new CreateMoMoResponse(orderId, payUrl, qrCodeUrl);
    }

    // Query Order
    public QueryMoMoResponse queryOrder(String orderId) {
        MoMoOrder order = repo.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        return new QueryMoMoResponse(order.getStatus());
    }

    // Webhook (IPN) — verify signature then mark as PAID / FAILED
    public boolean verifyWebhookSignature(Map<String, Object> payload, String receivedSignature) {
        try {
            // MoMo IPN raw signature string
            String rawSignature = "accessKey=" + accessKey
                    + "&amount=" + payload.get("amount")
                    + "&extraData=" + payload.getOrDefault("extraData", "")
                    + "&message=" + payload.getOrDefault("message", "")
                    + "&orderId=" + payload.get("orderId")
                    + "&orderInfo=" + payload.getOrDefault("orderInfo", "")
                    + "&orderType=" + payload.getOrDefault("orderType", "")
                    + "&partnerCode=" + payload.getOrDefault("partnerCode", "")
                    + "&payType=" + payload.getOrDefault("payType", "")
                    + "&requestId=" + payload.getOrDefault("requestId", "")
                    + "&responseTime=" + payload.getOrDefault("responseTime", "")
                    + "&resultCode=" + payload.getOrDefault("resultCode", "")
                    + "&transId=" + payload.getOrDefault("transId", "");

            String computed = HmacUtils.hmacSha256(secretKey, rawSignature);
            log.info("[MoMo] Webhook verify — computed={}, received={}", computed, receivedSignature);
            return computed.equals(receivedSignature);
        } catch (Exception e) {
            log.error("[MoMo] Signature verification failed", e);
            return false;
        }
    }

    // Status transitions
    public void markPaid(String orderId) {
        MoMoOrder order = repo.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        order.setStatus("PAID");
        order.setPaidAt(Instant.now());
        order.setUpdatedAt(Instant.now());
        repo.save(order);
        log.info("[MoMo] Order {} marked as PAID", orderId);
    }

    public void markFailed(String orderId) {
        MoMoOrder order = repo.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        order.setStatus("FAILED");
        order.setUpdatedAt(Instant.now());
        repo.save(order);
        log.info("[MoMo] Order {} marked as FAILED", orderId);
    }

    public void markExpired(String orderId) {
        MoMoOrder order = repo.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        order.setStatus("EXPIRED");
        order.setUpdatedAt(Instant.now());
        repo.save(order);
        log.info("[MoMo] Order {} marked as EXPIRED", orderId);
    }

    public List<MoMoOrder> getAllOrders() {
        return repo.findAll();
    }

    public void deleteOrder(String orderId) {
        MoMoOrder order = repo.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalStateException("Cannot cancel an order that is not PENDING");
        }
        repo.delete(order);
        log.info("[MoMo] Order {} cancelled", orderId);
    }
}
