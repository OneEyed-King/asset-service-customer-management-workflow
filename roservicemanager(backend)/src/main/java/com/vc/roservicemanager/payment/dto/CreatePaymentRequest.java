package com.vc.roservicemanager.payment.dto;

import com.vc.roservicemanager.common.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreatePaymentRequest(

        @NotNull
        UUID customerId,

        /** Optional - tags the payment to a specific asset for context on the ledger. */
        UUID customerAssetId,

        /** Optional - tags the payment to a specific AMC contract for context on the ledger. */
        UUID amcContractId,

        @NotNull
        @Positive
        BigDecimal amount,

        @NotNull
        LocalDate paymentDate,

        @NotNull
        PaymentMethod method,

        String referenceNote,

        /** Optional - who collected/recorded the payment, if you want it on record. */
        UUID recordedById

) {
}
