package com.vc.roservicemanager.payment.entity;

import com.vc.roservicemanager.amc.entity.AmcContract;
import com.vc.roservicemanager.auth.entity.User;
import com.vc.roservicemanager.common.entity.BaseEntity;
import com.vc.roservicemanager.common.enums.PaymentMethod;
import com.vc.roservicemanager.customer.entity.Customer;
import com.vc.roservicemanager.customerasset.entity.CustomerAsset;
import com.vc.roservicemanager.tenant.entity.Tenant;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Money actually received from a customer - the start of a real ledger.
 * Always tied to a customer; optionally tagged to the specific asset or AMC
 * contract it was for, purely for context on the ledger view (e.g. "this
 * ₹2,000 was for the AMC renewal on the kitchen RO unit"). An untagged
 * payment is still valid - a general advance or a payment the office
 * collected without itemizing it against anything specific yet.
 */
@Entity
@Table(name = "payment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_asset_id")
    private CustomerAsset customerAsset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "amc_contract_id")
    private AmcContract amcContract;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod method;

    private String referenceNote;

    /** Who recorded the payment. Optional - not every entry needs a named staff member. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by")
    private User recordedBy;

}
