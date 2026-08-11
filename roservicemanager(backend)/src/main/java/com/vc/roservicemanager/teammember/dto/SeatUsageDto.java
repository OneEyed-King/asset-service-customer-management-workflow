package com.vc.roservicemanager.teammember.dto;

import com.vc.roservicemanager.tenant.entity.PlanTier;

public record SeatUsageDto(

        int used,

        // Null means unlimited (Enterprise / no limit configured).
        Integer limit,

        PlanTier planTier

) {
}
