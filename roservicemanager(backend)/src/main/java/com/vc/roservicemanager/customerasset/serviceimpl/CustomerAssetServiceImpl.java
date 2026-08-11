package com.vc.roservicemanager.customerasset.serviceimpl;

import com.vc.roservicemanager.common.exception.ApiException;

import com.vc.roservicemanager.auth.security.CurrentTenantProvider;
import com.vc.roservicemanager.customer.entity.Customer;
import com.vc.roservicemanager.customer.serviceimpl.CustomerFinder;
import com.vc.roservicemanager.customerasset.dto.CustomerAssetDto;
import com.vc.roservicemanager.customerasset.dto.CustomerAssetRequest;
import com.vc.roservicemanager.customerasset.entity.CustomerAsset;
import com.vc.roservicemanager.customerasset.repository.CustomerAssetRepository;
import com.vc.roservicemanager.customerasset.service.CustomerAssetService;
import com.vc.roservicemanager.tenant.entity.Tenant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class CustomerAssetServiceImpl implements CustomerAssetService {

    private final CustomerAssetRepository customerAssetRepository;

    private final CustomerFinder customerFinder;

    private final CurrentTenantProvider currentTenantProvider;

    // =========================================================
    // Create
    // =========================================================

    @Override
    public CustomerAssetDto create(CustomerAssetRequest request) {

        log.info("Creating asset '{}' for customer '{}'",
                request.name(),
                request.customerId());

        validateDates(request);

        UUID tenantId = currentTenantProvider.getTenantId();

        // customerFinder.get() is already tenant-scoped, so this also
        // guarantees the asset's parent customer belongs to this tenant.
        Customer customer = customerFinder.get(request.customerId());

        // Reference-only Tenant: Tenant uses a plain Lombok @Builder (not
        // @SuperBuilder), so its builder doesn't expose the inherited
        // BaseEntity `id` field. Setting it via the inherited setter gives
        // JPA just enough of a managed reference to persist the FK without
        // an extra round-trip to load the full Tenant row.
        Tenant tenantRef = new Tenant();
        tenantRef.setId(tenantId);

        CustomerAsset asset = CustomerAsset.builder()
                .tenant(tenantRef)
                .customer(customer)
                .name(request.name())
                .brand(request.brand())
                .assetType(request.assetType())
                .assetSource(request.assetSource())
                .serialNumber(request.serialNumber())
                .purchasePrice(request.purchasePrice())
                .amountPaid(request.amountPaid())
                .paymentStatus(request.paymentStatus())
                .purchaseDate(request.purchaseDate())
                .installationDate(request.installationDate())
                .warrantyExpiry(request.warrantyExpiry())
                .underAmc(request.underAmc())
                .serviceIntervalDays(request.underAmc() ? request.serviceIntervalDays() : null)
                .nextServiceDate(request.underAmc() ? request.nextServiceDate() : null)
                .installationLocation(request.installationLocation())
                .notes(request.notes())
                .build();

        CustomerAsset savedAsset = customerAssetRepository.save(asset);

        log.info("Asset '{}' created successfully.",
                savedAsset.getId());

        return toDto(savedAsset);
    }

    // =========================================================
    // Read
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public CustomerAssetDto getById(UUID id) {

        log.debug("Fetching asset '{}'", id);

        return toDto(getAsset(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerAssetDto> getAll(Pageable pageable) {

        log.debug("Fetching all assets.");

        UUID tenantId = currentTenantProvider.getTenantId();

        return customerAssetRepository
                .findByActiveTrueAndTenantId(tenantId, pageable)
                .map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerAssetDto> getByCustomer(
            UUID customerId,
            Pageable pageable) {

        log.debug("Fetching assets for customer '{}'",
                customerId);

        UUID tenantId = currentTenantProvider.getTenantId();

        // Validate customer exists and belongs to this tenant.
        customerFinder.get(customerId);

        return customerAssetRepository
                .findByCustomerIdAndActiveTrueAndTenantId(customerId, tenantId, pageable)
                .map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerAssetDto> getDueForService(Pageable pageable) {

        log.debug("Fetching assets due for service.");

        UUID tenantId = currentTenantProvider.getTenantId();

        return customerAssetRepository
                .findByActiveTrueAndTenantIdAndUnderAmcTrueAndNextServiceDateIsNotNull(tenantId, pageable)
                .map(this::toDto);
    }

    // =========================================================
    // Update
    // =========================================================

    @Override
    public CustomerAssetDto update(
            UUID id,
            CustomerAssetRequest request) {

        log.info("Updating asset '{}'", id);

        validateDates(request);

        CustomerAsset asset = getAsset(id);

        Customer customer = customerFinder.get(request.customerId());

        asset.setCustomer(customer);
        asset.setName(request.name());
        asset.setBrand(request.brand());
        asset.setAssetType(request.assetType());
        asset.setAssetSource(request.assetSource());
        asset.setSerialNumber(request.serialNumber());
        asset.setPurchasePrice(request.purchasePrice());
        asset.setAmountPaid(request.amountPaid());
        asset.setPaymentStatus(request.paymentStatus());
        asset.setPurchaseDate(request.purchaseDate());
        asset.setInstallationDate(request.installationDate());
        asset.setWarrantyExpiry(request.warrantyExpiry());
        asset.setUnderAmc(request.underAmc());
        asset.setServiceIntervalDays(request.underAmc() ? request.serviceIntervalDays() : null);
        asset.setNextServiceDate(request.underAmc() ? request.nextServiceDate() : null);
        asset.setInstallationLocation(request.installationLocation());
        asset.setNotes(request.notes());

        CustomerAsset updatedAsset = customerAssetRepository.save(asset);

        log.info("Asset '{}' updated successfully.",
                updatedAsset.getId());

        return toDto(updatedAsset);
    }

    // =========================================================
    // Delete
    // =========================================================

    @Override
    public void deactivate(UUID id) {

        log.info("Deactivating asset '{}'", id);

        CustomerAsset asset = getAsset(id);

        asset.setActive(false);

        customerAssetRepository.save(asset);

        log.info("Asset '{}' deactivated successfully.", id);
    }

    // =========================================================
    // Private Helpers
    // =========================================================

    // An asset can't have gone into service before it was sold/purchased -
    // only checked when both dates are actually supplied, since either one
    // being blank is valid (e.g. a service-only asset with no purchase
    // date on file).
    private void validateDates(CustomerAssetRequest request) {

        if (request.purchaseDate() != null
                && request.installationDate() != null
                && request.installationDate().isBefore(request.purchaseDate())) {

            throw ApiException.badRequest(
                    "Installation date cannot be earlier than purchase date");
        }
    }

    private CustomerAsset getAsset(UUID id) {

        UUID tenantId = currentTenantProvider.getTenantId();

        return customerAssetRepository.findByIdAndActiveTrueAndTenantId(id, tenantId)
                .orElseThrow(() ->
                        ApiException.notFound("Asset not found"));
    }

    private CustomerAssetDto toDto(CustomerAsset asset) {

        return new CustomerAssetDto(
                asset.getId(),
                asset.getCustomer().getId(),
                asset.getCustomer().getName(),
                asset.getName(),
                asset.getBrand(),
                asset.getAssetType(),
                asset.getAssetSource(),
                asset.getSerialNumber(),
                asset.getPurchasePrice(),
                asset.getAmountPaid(),
                asset.getPaymentStatus(),
                asset.getPurchaseDate(),
                asset.getInstallationDate(),
                asset.getWarrantyExpiry(),
                asset.isUnderAmc(),
                asset.getServiceIntervalDays(),
                asset.getNextServiceDate(),
                asset.getInstallationLocation(),
                asset.getNotes()
        );
    }

}
