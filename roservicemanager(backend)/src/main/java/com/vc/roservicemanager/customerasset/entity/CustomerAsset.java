package com.vc.roservicemanager.customerasset.entity;

import com.vc.roservicemanager.common.entity.BaseEntity;
import com.vc.roservicemanager.common.enums.AssetSource;
import com.vc.roservicemanager.common.enums.AssetType;
import com.vc.roservicemanager.common.enums.PaymentStatus;
import com.vc.roservicemanager.customer.entity.Customer;
import com.vc.roservicemanager.tenant.entity.Tenant;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "customer_assets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerAsset extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    private String name;

    private String brand;

    @Enumerated(EnumType.STRING)
    private AssetType assetType;

    @Enumerated(EnumType.STRING)
    private AssetSource assetSource;

    private String serialNumber;

    private BigDecimal purchasePrice;

    private BigDecimal amountPaid;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    private LocalDate purchaseDate;

    private LocalDate installationDate;

    private LocalDate warrantyExpiry;

    private Integer serviceIntervalDays;

    private LocalDate nextServiceDate;

    private String installationLocation;

    // Whether this asset is under a recurring service arrangement (AMC or
    // otherwise). Only assets with this set to true should carry a
    // serviceIntervalDays / nextServiceDate - a one-off repair job on
    // equipment we didn't sell has no reason to force a "service expiry"
    // reminder on the business.
    @Builder.Default
    private boolean underAmc = false;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // @Builder.Default is required here - Lombok's plain @Builder ignores
    // field initializers otherwise, so CustomerAsset.builder().build()
    // without this would silently save active=false on every new asset
    // (matches the pattern already used correctly on Customer.active and
    // User.enabled).
    @Builder.Default
    private boolean active = true;
}
