package com.vc.roservicemanager.customerasset.repository;

import com.vc.roservicemanager.customerasset.entity.CustomerAsset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerAssetRepository
        extends JpaRepository<CustomerAsset, UUID> {

    Optional<CustomerAsset> findByIdAndActiveTrueAndTenantId(UUID id, UUID tenantId);

    Page<CustomerAsset> findByActiveTrueAndTenantId(UUID tenantId, Pageable pageable);

    Page<CustomerAsset> findByCustomerIdAndActiveTrueAndTenantId(
            UUID customerId,
            UUID tenantId,
            Pageable pageable
    );

}
