package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CreateOrderRequest {
    private Long amount;
    private String orderInfo;
    private String method;

    private String userId;    
    private String userName;  
    private String userEmail;
}