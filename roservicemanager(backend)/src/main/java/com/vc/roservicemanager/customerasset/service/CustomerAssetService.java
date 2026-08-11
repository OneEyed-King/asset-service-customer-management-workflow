package com.vc.roservicemanager.customerasset.service;

import com.vc.roservicemanager.customerasset.dto.CustomerAssetDto;
import com.vc.roservicemanager.customerasset.dto.CustomerAssetRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface CustomerAssetService {

    CustomerAssetDto create(CustomerAssetRequest request);

    CustomerAssetDto getById(UUID id);

    Page<CustomerAssetDto> getAll(Pageable pageable);

    Page<CustomerAssetDto> getByCustomer(
            UUID customerId,
            Pageable pageable
    );

    // Active, under-AMC assets that have a next-due date - what the
    // Services page's "Due & Upcoming" tab and the dashboard both draw
    // from. Sort order is controller-driven, same convention as getAll.
    Page<CustomerAssetDto> getDueForService(Pageable pageable);

    CustomerAssetDto update(
            UUID id,
            CustomerAssetRequest request
    );

    void deactivate(UUID id);

}