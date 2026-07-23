package com.vc.roservicemanager.common.support;

import com.vc.roservicemanager.customerasset.entity.CustomerAsset;
import com.vc.roservicemanager.customerasset.repository.CustomerAssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CustomerAssetSupport {

    private final CustomerAssetRepository repository;

    public CustomerAsset getActiveAsset(UUID id) {

        return repository.findByIdAndActiveTrue(id)
                .orElseThrow(() ->
                        new RuntimeException("Asset not found"));
    }

}