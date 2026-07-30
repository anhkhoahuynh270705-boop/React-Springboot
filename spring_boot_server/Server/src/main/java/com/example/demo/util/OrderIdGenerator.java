package com.example.demo.util;

import java.util.UUID;

public final class OrderIdGenerator {

    private OrderIdGenerator() {}

    public static String ticketNumber() {
        return "TK" + System.currentTimeMillis();
    }

    public static String qrCode() {
        return UUID.randomUUID().toString();
    }

    public static String momoOrderId() {
        return "MM-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    public static String zaloPayOrderId() {
        return "ZP-" + UUID.randomUUID();
    }

    public static String localPaymentOrderId() {
        return "local-" + UUID.randomUUID();
    }
}
