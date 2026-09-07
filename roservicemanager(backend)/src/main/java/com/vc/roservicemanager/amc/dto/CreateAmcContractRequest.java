package com.vc.roservicemanager.amc.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateAmcContractRequest(

        @NotNull
        UUID customerAssetId,

        String planName,

        @NotNull
        LocalDate startDate,

        @NotNull
        LocalDate endDate,

        @NotNull
        @Positive
        BigDecimal price,

        /** Optional - null means unlimited visits for the term. */
        Integer visitsIncluded

) {
}
