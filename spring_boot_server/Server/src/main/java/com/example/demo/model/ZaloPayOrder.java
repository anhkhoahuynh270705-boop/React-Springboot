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
@Document(collection = "zalopay_orders")
public class ZaloPayOrder {
	private @Id String id;
	private String appTransId;
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