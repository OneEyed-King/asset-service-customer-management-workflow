package com.vc.roservicemanager.servicehistory.entity;

import com.vc.roservicemanager.auth.entity.User;
import com.vc.roservicemanager.common.entity.BaseEntity;
import com.vc.roservicemanager.customerasset.entity.CustomerAsset;
import com.vc.roservicemanager.tenant.entity.Tenant;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * One service visit performed against a CustomerAsset - e.g. "changed the
 * RO candle/filter on this date, next change due in 30 days". Creating a
 * record here is also what advances the parent CustomerAsset's
 * nextServiceDate (see ServiceHistoryServiceImpl.create()).
 */
@Entity
@Table(name = "service_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_asset_id", nullable = false)
    private CustomerAsset customerAsset;

    @Column(nullable = false)
    private LocalDate serviceDate;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    private LocalDate nextServiceDate;

    /** Who performed the service. Optional - not every visit needs a named technician recorded. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serviced_by")
    private User servicedBy;

    // Whether the visit actually got the service done. False covers things
    // like "customer wasn't home" or "part unavailable" - still worth a
    // record, but shouldn't be treated the same as a finished job.
    @Builder.Default
    private boolean completed = true;

    // Null for the common case (a routine AMC visit, already covered by
    // the contract price). Set for off-schedule/complaint visits, where
    // the customer is billed directly for that call-out.
    private BigDecimal amountCharged;

}
