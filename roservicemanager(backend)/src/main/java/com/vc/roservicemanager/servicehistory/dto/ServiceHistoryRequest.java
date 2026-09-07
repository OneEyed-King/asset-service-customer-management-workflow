package com.vc.roservicemanager.servicehistory.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ServiceHistoryRequest(

        @NotNull
        UUID customerAssetId,

        @NotNull
        LocalDate serviceDate,

        String remarks,

        /**
         * Optional - if omitted, the service defaults to
         * serviceDate + the asset's serviceIntervalDays (e.g. "changed the
         * candle today, due again in 30 days" without the caller having to
         * do that math).
         */
        LocalDate nextServiceDate,

        /** Optional - who performed the service, if you want it on record. */
        UUID servicedById,

        /**
         * Optional - null/omitted defaults to true (completed). Set false
         * for a visit that didn't actually finish the job (customer not
         * home, part unavailable, etc). When false, nextServiceDate is NOT
         * auto-calculated from the asset's interval - only an explicit
         * value here reschedules the asset's due date; otherwise it's left
         * as-is (still due/overdue).
         */
        Boolean completed,

        /**
         * Optional - set for an off-schedule/complaint visit the customer is
         * billed for directly. Leave null for a routine AMC visit already
         * covered by the contract price.
         */
        @Positive
        BigDecimal amountCharged

) {
}
