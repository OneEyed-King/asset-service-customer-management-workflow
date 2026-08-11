package com.vc.roservicemanager.platformadmin.dto;

import com.vc.roservicemanager.tenant.entity.PlanTier;
import com.vc.roservicemanager.tenant.entity.TenantStatus;

import java.util.UUID;

public record TenantDto(

        UUID id,

        String businessName,

        PlanTier planTier,

        TenantStatus status,

        /** Null means unlimited. */
        Integer seatLimit,

        int seatsUsed

) {
}
