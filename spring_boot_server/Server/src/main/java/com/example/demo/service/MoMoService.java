package com.example.demo.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import com.example.demo.util.OrderIdGenerator;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.demo.dto.CreateMoMoResponse;
import com.example.demo.dto.QueryMoMoResponse;
import com.example.demo.model.MoMoOrder;
import com.example.demo.repository.MoMoOrderRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MoMoService {
	private final MoMoOrderRepository repo;

	@Value("${momo.static-qr-url}")
	private String momoStaticQrUrl;

	@Value("${frontend.url}")
	private String frontendUrl;

	// Helper method to build MoMo payment URL 
	private String buildPayUrl(String orderId, long amount, String description) {
        String encodedDescription = URLEncoder.encode(
                description != null ? description : "",
                StandardCharsets.UTF_8
        );

        return frontendUrl + "/momo-payment"
                + "?orderId=" + orderId
                + "&amount=" + amount
                + "&description=" + encodedDescription;
    }

    private String buildQrUrl() {
        return momoStaticQrUrl;
    }

	public CreateMoMoResponse createOrder(String userLabel, long amount, String description) {
		String orderId = OrderIdGenerator.momoOrderId();
		String payUrl = buildPayUrl(orderId, amount, description);
		String qrUrl = buildQrUrl();

		MoMoOrder order = new MoMoOrder(
			null, 
			orderId,
			userLabel, 
			amount, 
			description,
			"PENDING", 
			payUrl, 
			qrUrl, 
			Instant.now(), 
			Instant.now(), 
			null
		);
		repo.save(order);
		return new CreateMoMoResponse(orderId, payUrl, qrUrl);
	}

	public QueryMoMoResponse queryOrder(String orderId) {
		MoMoOrder order = repo.findByOrderId(orderId)
			.orElseThrow(() -> new IllegalArgumentException("Order not found"));
		return new QueryMoMoResponse(order.getStatus());
	}

	public void markPaid(String orderId) {
		MoMoOrder order = repo.findByOrderId(orderId)
			.orElseThrow(() -> new IllegalArgumentException("Order not found"));
		order.setStatus("PAID");
		order.setPaidAt(Instant.now());
		order.setUpdatedAt(Instant.now());
		repo.save(order);
	}

	public void markExpired(String orderId) {
		MoMoOrder order = repo.findByOrderId(orderId)
			.orElseThrow(() -> new IllegalArgumentException("Order not found"));
		order.setStatus("EXPIRED");
		order.setUpdatedAt(Instant.now());
		repo.save(order);
	}

	public List<MoMoOrder> getAllOrders() {
		return repo.findAll();
	}

	public void deleteOrder(String orderId) {
		MoMoOrder order = repo.findByOrderId(orderId)
			.orElseThrow(() -> new IllegalArgumentException("Order not found"));
		// Only allow deleting PENDING orders (not paid ones)
		if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
			throw new IllegalStateException("Cannot cancel an order that is not pending");
		}
		repo.delete(order);
	}
}
