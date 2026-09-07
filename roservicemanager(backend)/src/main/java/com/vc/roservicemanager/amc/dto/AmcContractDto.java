package com.vc.roservicemanager.amc.dto;

import com.vc.roservicemanager.common.enums.AmcContractStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record AmcContractDto(

        UUID id,

        UUID customerAssetId,
        String assetName,

        UUID customerId,
        String customerName,

        String planName,

        LocalDate startDate,
        LocalDate endDate,

        BigDecimal price,

        Integer visitsIncluded,

        AmcContractStatus status,

        // Derived from endDate vs today, not stored - see AmcContractStatus.
        boolean expired

) {
}
