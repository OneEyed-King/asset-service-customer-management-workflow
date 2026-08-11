package com.vc.roservicemanager.common.support;

import com.vc.roservicemanager.common.exception.ApiException;

import com.vc.roservicemanager.auth.security.CurrentTenantProvider;
import com.vc.roservicemanager.customerasset.entity.CustomerAsset;
import com.vc.roservicemanager.customerasset.repository.CustomerAssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CustomerAssetSupport {

    private final CustomerAssetRepository repository;
    private final CurrentTenantProvider currentTenantProvider;

    public CustomerAsset getActiveAsset(UUID id) {

        UUID tenantId = currentTenantProvider.getTenantId();

        return repository.findByIdAndActiveTrueAndTenantId(id, tenantId)
                .orElseThrow(() ->
                        ApiException.notFound("Asset not found"));
    }

}
