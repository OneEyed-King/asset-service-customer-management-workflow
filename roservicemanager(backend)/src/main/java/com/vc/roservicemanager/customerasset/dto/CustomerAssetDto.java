package com.vc.roservicemanager.customerasset.dto;

import com.vc.roservicemanager.common.enums.AssetSource;
import com.vc.roservicemanager.common.enums.AssetType;
import com.vc.roservicemanager.common.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CustomerAssetDto(

        UUID id,

        UUID customerId,

        String customerName,

        String name,

        String brand,

        AssetType assetType,

        AssetSource assetSource,

        String serialNumber,

        BigDecimal purchasePrice,

        BigDecimal amountPaid,

        PaymentStatus paymentStatus,

        LocalDate purchaseDate,

        LocalDate installationDate,

        LocalDate warrantyExpiry,

        Integer serviceIntervalDays,

        LocalDate nextServiceDate,

        String installationLocation,

        String notes
) {}
