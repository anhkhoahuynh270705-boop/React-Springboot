package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.demo.model.ZaloPayOrder;

public interface ZaloPayOrderRepository extends MongoRepository<ZaloPayOrder, String> {
	Optional<ZaloPayOrder> findByAppTransId(String appTransId);
	boolean existsByAppTransId(String appTransId);
}