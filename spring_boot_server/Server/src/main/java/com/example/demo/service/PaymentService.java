package com.example.demo.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import com.example.demo.util.OrderIdGenerator;

import org.springframework.stereotype.Service;

import com.example.demo.dto.CreateOrderRequest;
import com.example.demo.dto.CreateOrderResponse;
import com.example.demo.dto.VerifyResponse;
import com.example.demo.model.PaymentOrder;
import com.example.demo.repository.PaymentOrderRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentOrderRepository repo;

    public CreateOrderResponse createOrder(CreateOrderRequest req) {
        String orderId = OrderIdGenerator.localPaymentOrderId();
        PaymentOrder order = new PaymentOrder(
                orderId,
                req.getAmount(),
                req.getOrderInfo(),
                req.getMethod(),
                "pending",
                Instant.now(),
                req.getUserId(),
                req.getUserName(),
                req.getUserEmail());
        repo.save(order);

        // Generate QR code URL and data
        String bankBin = "970407";
        String accountNo = "1221868856";
        String template = "compact";
        String amount = String.valueOf(order.getAmount());
        String addInfo = order.getOrderInfo() != null ? order.getOrderInfo() : order.getOrderId();

        String qrUrl = "https://img.vietqr.io/image/" + bankBin + "-" + accountNo + "-" + template
                + ".png?amount=" + amount + "&addInfo=" + urlEncode(addInfo);

        String qrData = "VietQR|" + bankBin + "|" + accountNo + "|" + amount + "|" + addInfo + "|" + order.getOrderId();

        return new CreateOrderResponse(order.getOrderId(), order.getStatus(), qrUrl, qrData);
    }

    public VerifyResponse verify(String orderId) {
        return repo.findById(orderId)
                .map(o -> new VerifyResponse(o.getOrderId(), o.getStatus()))
                .orElseGet(() -> new VerifyResponse(orderId, "failed"));
    }

    public VerifyResponse markPaid(String orderId) {
        return repo.findById(orderId).map(o -> {
            o.setStatus("paid");
            repo.save(o);
            return new VerifyResponse(o.getOrderId(), o.getStatus());
        }).orElseGet(() -> new VerifyResponse(orderId, "failed"));
    }

    public VerifyResponse markExpired(String orderId) {
        return repo.findById(orderId).map(o -> {
            o.setStatus("expired");
            repo.save(o);
            return new VerifyResponse(o.getOrderId(), o.getStatus());
        }).orElseGet(() -> new VerifyResponse(orderId, "failed"));
    }

    public List<PaymentOrder> getAllOrders() {
        return repo.findAll();
    }

    public void deleteOrder(String orderId) {
        PaymentOrder order = repo.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        // Only allow deleting pending orders (not paid ones)
        if (!"pending".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalStateException("Cannot cancel an order that is not pending");
        }
        repo.deleteById(orderId);
    }

    private String urlEncode(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }
}
