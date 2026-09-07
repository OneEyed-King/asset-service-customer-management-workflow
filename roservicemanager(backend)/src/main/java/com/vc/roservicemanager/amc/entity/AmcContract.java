package com.vc.roservicemanager.amc.entity;

import com.vc.roservicemanager.common.entity.BaseEntity;
import com.vc.roservicemanager.common.enums.AmcContractStatus;
import com.vc.roservicemanager.customerasset.entity.CustomerAsset;
import com.vc.roservicemanager.tenant.entity.Tenant;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * An AMC as an actual dated, priced contract - what CustomerAsset.underAmc
 * couldn't express on its own. Deliberately independent of that boolean:
 * underAmc still just controls whether the asset shows service-interval
 * fields in the UI, while this is the record of what was actually charged
 * and when the term runs. Creating a contract doesn't retroactively change
 * underAmc - that stays a separate, explicit choice on the asset itself.
 */
@Entity
@Table(name = "amc_contract")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AmcContract extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_asset_id", nullable = false)
    private CustomerAsset customerAsset;

    private String planName;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private BigDecimal price;

    /** Null means unlimited visits for the term. */
    private Integer visitsIncluded;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AmcContractStatus status = AmcContractStatus.ACTIVE;

}
