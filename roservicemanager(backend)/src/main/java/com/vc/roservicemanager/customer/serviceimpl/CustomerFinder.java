package com.vc.roservicemanager.customer.serviceimpl;

import com.vc.roservicemanager.auth.security.CurrentTenantProvider;
import com.vc.roservicemanager.customer.entity.Customer;
import com.vc.roservicemanager.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Shared "give me this customer, scoped to the current tenant" lookup used
 * by both the Customer and CustomerAsset modules (a CustomerAsset always
 * needs to validate its parent Customer belongs to the same tenant).
 */
@Component
@RequiredArgsConstructor
public class CustomerFinder {

    private final CustomerRepository repository;
    private final CurrentTenantProvider currentTenantProvider;

    public Customer get(UUID id) {

        UUID tenantId = currentTenantProvider.getTenantId();

        return repository.findByIdAndActiveTrueAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }
}
