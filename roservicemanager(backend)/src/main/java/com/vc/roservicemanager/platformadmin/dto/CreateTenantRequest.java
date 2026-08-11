package com.vc.roservicemanager.platformadmin.dto;

import com.vc.roservicemanager.tenant.entity.PlanTier;
import com.vc.roservicemanager.tenant.entity.TenantStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateTenantRequest(

        @NotBlank
        String businessName,

        @NotNull
        PlanTier planTier,

        /** Null means unlimited (Enterprise / no limit configured). */
        Integer seatLimit,

        /** Defaults to ACTIVE if omitted. */
        TenantStatus status

) {
}
