package com.example.demo.util;

import com.stripe.param.checkout.SessionCreateParams;

public final class StripeUtils {

    private StripeUtils() {}

    public static SessionCreateParams buildVndSessionParams(
            long amount,
            String orderInfo,
            String userId,
            String successUrl,
            String cancelUrl) {

        return SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("vnd")
                                                .setUnitAmount(amount)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName(orderInfo)
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .putMetadata("userId", userId)
                .putMetadata("orderInfo", orderInfo)
                .build();
    }
}
