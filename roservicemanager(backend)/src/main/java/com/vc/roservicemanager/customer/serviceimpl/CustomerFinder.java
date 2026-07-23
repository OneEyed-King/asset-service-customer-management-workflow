package com.vc.roservicemanager.customer.serviceimpl;

import com.vc.roservicemanager.customer.entity.Customer;
import com.vc.roservicemanager.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CustomerFinder {

    private final CustomerRepository repository;

    public Customer get(UUID id) {
        return repository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }
}