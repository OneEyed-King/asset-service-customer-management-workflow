package com.vc.roservicemanager.servicehistory.repository;

import com.vc.roservicemanager.servicehistory.entity.ServiceHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ServiceHistoryRepository extends JpaRepository<ServiceHistory, UUID> {

    Optional<ServiceHistory> findByIdAndTenantId(UUID id, UUID tenantId);

    // Sort order comes from the controller's @PageableDefault, not baked
    // into the method name, so it stays consistent with the rest of the
    // codebase's repositories (e.g. CustomerAssetRepository).
    Page<ServiceHistory> findByTenantIdAndCustomerAssetId(
            UUID tenantId, UUID customerAssetId, Pageable pageable);

    // Nested property traversal: ServiceHistory -> customerAsset -> customer -> id.
    // Spring Data derives the join from the property path, no @Query needed.
    Page<ServiceHistory> findByTenantIdAndCustomerAsset_Customer_Id(
            UUID tenantId, UUID customerId, Pageable pageable);

    // Tenant-wide list for the standalone Services page - same
    // controller-driven-sort pattern as the other finders above.
    Page<ServiceHistory> findByTenantId(UUID tenantId, Pageable pageable);

    // Dashboard's "recent activity" feed - capped via the caller's
    // Pageable (e.g. PageRequest.of(0, 5)), newest first.
    List<ServiceHistory> findByTenantIdOrderByServiceDateDescCreatedAtDesc(
            UUID tenantId, Pageable pageable);

    // Feeds the customer ledger summary's "total charges" figure - this is
    // what closes the gap where an off-schedule/complaint visit (no AMC
    // contract behind it) previously had no way to become a charge at all.
    // COALESCE keeps this a plain 0 (not null) when nothing's been charged.
    @Query("""
            SELECT COALESCE(SUM(s.amountCharged), 0)
            FROM ServiceHistory s
            WHERE s.tenant.id = :tenantId
              AND s.customerAsset.customer.id = :customerId
            """)
    BigDecimal sumAmountChargedByCustomer(@Param("tenantId") UUID tenantId, @Param("customerId") UUID customerId);

}
