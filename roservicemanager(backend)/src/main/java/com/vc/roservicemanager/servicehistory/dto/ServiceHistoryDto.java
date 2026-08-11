package com.vc.roservicemanager.servicehistory.dto;

import java.time.LocalDate;
import java.util.UUID;

public record ServiceHistoryDto(

        UUID id,

        UUID customerAssetId,
        String assetName,

        UUID customerId,
        String customerName,

        LocalDate serviceDate,

        String remarks,

        LocalDate nextServiceDate,

        UUID servicedById,
        String servicedByName,

        boolean completed

) {
}
