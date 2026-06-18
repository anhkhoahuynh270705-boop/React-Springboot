package com.example.demo.repository;

import java.time.Instant;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.demo.model.PaymentOrder;

public interface PaymentOrderRepository extends MongoRepository<PaymentOrder, String> {
  List<PaymentOrder> findByUserIdAndAmountAndStatusAndCreatedAtAfter(
      String userId, Long amount, String status, Instant createdAtAfter
  );
}