package com.example.demo.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "momo_orders")
public class MoMoOrder {
	@Id
	private String id;
	private String orderId;
	private String userLabel;
	private long amount;
	private String description;
	private String status;
	private String payUrl;
	private String qrUrl;
	private Instant createdAt;
	private Instant updatedAt;
	private Instant paidAt;
}
