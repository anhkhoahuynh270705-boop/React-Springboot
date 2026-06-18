package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreateMoMoResponse {
	private String orderId;
	private String payUrl;
	private String qrUrl;
}
