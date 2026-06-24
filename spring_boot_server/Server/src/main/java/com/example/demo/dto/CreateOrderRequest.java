package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CreateOrderRequest {
    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be greater than 0")
    private Long amount;

    @NotBlank(message = "Order info is required")
    private String orderInfo;

    @NotBlank(message = "Payment method is required")
    private String method;

    @NotBlank(message = "User ID is required")
    private String userId;

    private String userName;

    @NotBlank(message = "User email is required")
    @Email(message = "User email format is invalid")
    private String userEmail;
}