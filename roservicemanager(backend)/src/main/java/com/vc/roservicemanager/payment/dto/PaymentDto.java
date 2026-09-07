package com.vc.roservicemanager.payment.dto;

import com.vc.roservicemanager.common.enums.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PaymentDto(

        UUID id,

        UUID customerId,
        String customerName,

        UUID customerAssetId,
        String assetName,

        UUID amcContractId,
        String amcPlanName,

        BigDecimal amount,
        LocalDate paymentDate,
        PaymentMethod method,
        String referenceNote,

        UUID recordedById,
        String recordedByName

) {
}
