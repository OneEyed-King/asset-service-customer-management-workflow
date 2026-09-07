package com.vc.roservicemanager.payment.repository;

import com.vc.roservicemanager.payment.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    // Sort order comes from the controller's @PageableDefault, same
    // convention as the rest of the repositories in this codebase.
    Page<Payment> findByTenantIdAndCustomerId(UUID tenantId, UUID customerId, Pageable pageable);

    // Feeds the customer ledger summary's "total paid" figure - COALESCE
    // keeps this a plain 0 (not null) when a customer has no payments yet.
    @Query("""
            SELECT COALESCE(SUM(p.amount), 0)
            FROM Payment p
            WHERE p.tenant.id = :tenantId
              AND p.customer.id = :customerId
            """)
    BigDecimal sumAmountByCustomer(@Param("tenantId") UUID tenantId, @Param("customerId") UUID customerId);

}
