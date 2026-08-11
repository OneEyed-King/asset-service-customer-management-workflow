package com.vc.roservicemanager.customerasset.repository;

import com.vc.roservicemanager.customerasset.entity.CustomerAsset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
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

    long countByActiveTrueAndTenantId(UUID tenantId);

    long countByActiveTrueAndTenantIdAndUnderAmcTrue(UUID tenantId);

    long countByActiveTrueAndTenantIdAndUnderAmcTrueAndNextServiceDateLessThan(
            UUID tenantId, LocalDate before);

    long countByActiveTrueAndTenantIdAndUnderAmcTrueAndNextServiceDateBetween(
            UUID tenantId, LocalDate start, LocalDate end);

    // Dashboard's "upcoming/overdue" list - active, under-AMC assets that
    // actually have a next-due date, soonest first. Pageable is used purely
    // to cap how many rows come back (e.g. PageRequest.of(0, 10)).
    List<CustomerAsset> findByActiveTrueAndTenantIdAndUnderAmcTrueAndNextServiceDateIsNotNullOrderByNextServiceDateAsc(
            UUID tenantId, Pageable pageable);

    // Same filter, but properly paginated (Page instead of a capped List) -
    // used by the Services page's "Due & Upcoming" tab, which needs to show
    // the whole list rather than just a dashboard-sized preview. Sort order
    // comes from the controller's @PageableDefault, matching the pattern
    // used everywhere else in this repository.
    Page<CustomerAsset> findByActiveTrueAndTenantIdAndUnderAmcTrueAndNextServiceDateIsNotNull(
            UUID tenantId, Pageable pageable);

}
