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

    CustomerAssetDto update(
            UUID id,
            CustomerAssetRequest request
    );

    void deactivate(UUID id);

}