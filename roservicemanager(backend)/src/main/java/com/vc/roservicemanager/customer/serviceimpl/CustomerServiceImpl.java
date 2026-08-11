package com.vc.roservicemanager.customer.serviceimpl;

import com.vc.roservicemanager.common.exception.ApiException;

import com.vc.roservicemanager.auth.security.CurrentTenantProvider;
import com.vc.roservicemanager.customer.dto.CustomerDto;
import com.vc.roservicemanager.customer.dto.CustomerRequest;
import com.vc.roservicemanager.customer.dto.CustomerSearchDto;
import com.vc.roservicemanager.customer.entity.Customer;
import com.vc.roservicemanager.customer.repository.CustomerRepository;
import com.vc.roservicemanager.customer.service.CustomerService;
import com.vc.roservicemanager.tenant.entity.Tenant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final CurrentTenantProvider currentTenantProvider;

    @Override
    public CustomerDto create(CustomerRequest request) {

        UUID tenantId = currentTenantProvider.getTenantId();

        // Reference-only Tenant: Tenant uses a plain Lombok @Builder (not
        // @SuperBuilder), so its builder doesn't expose the inherited
        // BaseEntity `id` field. Setting it via the inherited setter gives
        // JPA just enough of a managed reference to persist the FK without
        // an extra round-trip to load the full Tenant row.
        Tenant tenantRef = new Tenant();
        tenantRef.setId(tenantId);

        Customer customer = Customer.builder()
                .tenant(tenantRef)
                .name(request.name())
                .contactNumber(request.contactNumber())
                .alternateContactNumber(request.alternateContactNumber())
                .email(request.email())
                .address(request.address())
                .notes(request.notes())
                .build();

        Customer savedCustomer = customerRepository.save(customer);
        log.info("Creating customer {}", request.contactNumber());
        return mapToDto(savedCustomer);

    }

    @Override
    @Transactional(readOnly = true)
    public CustomerDto getById(UUID id) {

        Customer customer = getCustomer(id);

        return mapToDto(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerDto> getAll(
            String search,
            Pageable pageable) {

        UUID tenantId = currentTenantProvider.getTenantId();

        Page<Customer> customers;

        if (search == null || search.isBlank()) {
            customers = customerRepository.findByActiveTrueAndTenantId(tenantId, pageable);
        } else {
            customers = customerRepository.searchCustomers(
                    tenantId,
                    search.trim(),
                    pageable
            );
        }

        return customers.map(CustomerServiceImpl::mapToDto);
    }

    @Override
    public CustomerDto update(UUID id, CustomerRequest request) {
        log.info("Updating customer {}", id);
        Customer customer = getCustomer(id);

        customer.setName(request.name());
        customer.setContactNumber(request.contactNumber());
        customer.setAlternateContactNumber(request.alternateContactNumber());
        customer.setEmail(request.email());
        customer.setAddress(request.address());
        customer.setNotes(request.notes());

        customer = customerRepository.save(customer);

        return mapToDto(customer);
    }

    @Override
    public void deactivate(UUID id) {
        log.info("Deactivating customer {}", id);
        Customer customer = getCustomer(id);

        customer.setActive(false);

        customerRepository.save(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerSearchDto> search(String query) {
        log.debug("Searching customers with query '{}'", query);
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }

        UUID tenantId = currentTenantProvider.getTenantId();

        return customerRepository.autoComplete(tenantId, query.trim(), 10)
                .stream()
                .map(customer -> new CustomerSearchDto(
                        customer.getId(),
                        customer.getName(),
                        customer.getContactNumber()
                ))
                .toList();
    }



    private static CustomerDto mapToDto(Customer customer) {

        return new CustomerDto(
                customer.getId(),
                customer.getName(),
                customer.getContactNumber(),
                customer.getAlternateContactNumber(),
                customer.getEmail(),
                customer.getAddress(),
                customer.getNotes()
        );
    }

    private Customer getCustomer(UUID id) {
        UUID tenantId = currentTenantProvider.getTenantId();
        return customerRepository.findByIdAndActiveTrueAndTenantId(id, tenantId)
                .orElseThrow(() -> ApiException.notFound("Customer not found"));
    }
}
