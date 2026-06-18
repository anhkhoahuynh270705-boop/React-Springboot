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
@Document(collection = "payment_orders")
public class PaymentOrder {
  @Id
  private String orderId;
  private Long amount;
  private String orderInfo;
  private String method;
  private String status;       
  private Instant createdAt;
  
  // Additional user details
  private String userId;
  private String userName;
  private String userEmail;
}