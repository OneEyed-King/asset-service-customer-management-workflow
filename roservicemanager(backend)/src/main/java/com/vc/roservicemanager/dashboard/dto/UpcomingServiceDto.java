package com.vc.roservicemanager.dashboard.dto;

import java.time.LocalDate;
import java.util.UUID;

/**
 * One row in the dashboard's "upcoming/overdue service" list - an
 * under-AMC asset with a next-due date, plus enough denormalized context
 * (customer + asset name) to render without a second lookup.
 */
public record UpcomingServiceDto(

        UUID customerAssetId,
        String assetName,

        UUID customerId,
        String customerName,

        LocalDate nextServiceDate,

        boolean overdue,

        // Carried along so the dashboard can open its own "log this
        // service" dialog inline (with a correct interval-based
        // suggestion) without a second round-trip to fetch the full asset.
        Integer serviceIntervalDays

) {
}
