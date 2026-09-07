package com.vc.roservicemanager.amc.repository;

import com.vc.roservicemanager.amc.entity.AmcContract;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AmcContractRepository extends JpaRepository<AmcContract, UUID> {

    Optional<AmcContract> findByIdAndTenantId(UUID id, UUID tenantId);

    // Sort order comes from the controller's @PageableDefault, same
    // convention as CustomerAssetRepository/ServiceHistoryRepository.
    Page<AmcContract> findByTenantIdAndCustomerAssetId(
            UUID tenantId, UUID customerAssetId, Pageable pageable);

    Page<AmcContract> findByTenantIdAndCustomerAsset_Customer_Id(
            UUID tenantId, UUID customerId, Pageable pageable);

    // Feeds the customer ledger summary's "total charges" figure -
    // COALESCE keeps this a plain 0 (not null) when a customer has no AMC
    // contracts at all.
    @Query("""
            SELECT COALESCE(SUM(a.price), 0)
            FROM AmcContract a
            WHERE a.tenant.id = :tenantId
              AND a.customerAsset.customer.id = :customerId
            """)
    BigDecimal sumPriceByCustomer(@Param("tenantId") UUID tenantId, @Param("customerId") UUID customerId);

}
