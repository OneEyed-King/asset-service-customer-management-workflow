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

    @Column(columnDefinition = "TEXT")
    private String notes;

    private boolean active = true;
}
