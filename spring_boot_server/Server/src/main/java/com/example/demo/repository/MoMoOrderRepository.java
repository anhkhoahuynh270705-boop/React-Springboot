package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.demo.model.MoMoOrder;

public interface MoMoOrderRepository extends MongoRepository<MoMoOrder, String> {
	Optional<MoMoOrder> findByOrderId(String orderId);
	boolean existsByOrderId(String orderId);
}
