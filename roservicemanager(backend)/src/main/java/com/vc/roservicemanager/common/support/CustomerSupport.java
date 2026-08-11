package com.vc.roservicemanager.common.support;

import com.vc.roservicemanager.common.exception.ApiException;

import com.vc.roservicemanager.auth.security.CurrentTenantProvider;
import com.vc.roservicemanager.customer.entity.Customer;
import com.vc.roservicemanager.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CustomerSupport {

    private final CustomerRepository repository;
    private final CurrentTenantProvider currentTenantProvider;

    public Customer getActiveCustomer(UUID id) {

        UUID tenantId = currentTenantProvider.getTenantId();

        return repository.findByIdAndActiveTrueAndTenantId(id, tenantId)
                .orElseThrow(() -> ApiException.notFound("Customer not found"));
    }

}
