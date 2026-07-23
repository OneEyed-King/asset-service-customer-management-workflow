package com.vc.roservicemanager.customerasset.serviceimpl;

import com.vc.roservicemanager.customer.entity.Customer;
import com.vc.roservicemanager.customer.serviceimpl.CustomerFinder;
import com.vc.roservicemanager.customerasset.dto.CustomerAssetDto;
import com.vc.roservicemanager.customerasset.dto.CustomerAssetRequest;
import com.vc.roservicemanager.customerasset.entity.CustomerAsset;
import com.vc.roservicemanager.customerasset.repository.CustomerAssetRepository;
import com.vc.roservicemanager.customerasset.service.CustomerAssetService;
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

    // =========================================================
    // Create
    // =========================================================

    @Override
    public CustomerAssetDto create(CustomerAssetRequest request) {

        log.info("Creating asset '{}' for customer '{}'",
                request.name(),
                request.customerId());

        Customer customer = customerFinder.get(request.customerId());

        CustomerAsset asset = CustomerAsset.builder()
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
                .serviceIntervalDays(request.serviceIntervalDays())
                .nextServiceDate(request.nextServiceDate())
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

        return customerAssetRepository
                .findByActiveTrue(pageable)
                .map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerAssetDto> getByCustomer(
            UUID customerId,
            Pageable pageable) {

        log.debug("Fetching assets for customer '{}'",
                customerId);

        // Validate customer exists.
        customerFinder.get(customerId);

        return customerAssetRepository
                .findByCustomerIdAndActiveTrue(customerId, pageable)
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
        asset.setServiceIntervalDays(request.serviceIntervalDays());
        asset.setNextServiceDate(request.nextServiceDate());
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

    private CustomerAsset getAsset(UUID id) {

        return customerAssetRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() ->
                        new RuntimeException("Asset not found"));
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
                asset.getServiceIntervalDays(),
                asset.getNextServiceDate(),
                asset.getInstallationLocation(),
                asset.getNotes()
        );
    }

}