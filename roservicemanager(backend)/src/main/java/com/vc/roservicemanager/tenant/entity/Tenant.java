package com.vc.roservicemanager.tenant.entity;

import com.vc.roservicemanager.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * A single paying business account (e.g. "Vishal's RO Services"). Every
 * other business record in the system (User, Customer, CustomerAsset, and
 * anything added later) belongs to exactly one Tenant via a tenant_id
 * foreign key, so that one business can never see another business's data.
 */
@Entity
@Table(name = "tenants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tenant extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String businessName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PlanTier planTier;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TenantStatus status;

    /**
     * Total number of team members (owner + admins + technicians combined)
     * this tenant is allowed to have. Null means "no limit set" - used for
     * Enterprise accounts with a manually negotiated seat count, and also
     * simply not enforced anywhere yet (seat-limit enforcement is a
     * deliberately deferred fast-follow, not part of this change).
     */
    @Column
    private Integer seatLimit;

}
