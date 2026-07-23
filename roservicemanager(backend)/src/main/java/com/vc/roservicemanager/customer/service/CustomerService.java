package com.vc.roservicemanager.customer.service;

import com.vc.roservicemanager.customer.dto.CustomerDto;
import com.vc.roservicemanager.customer.dto.CustomerRequest;
import com.vc.roservicemanager.customer.dto.CustomerSearchDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface CustomerService {

    CustomerDto create(CustomerRequest request);

    CustomerDto getById(UUID id);

    Page<CustomerDto> getAll(
            String search,
            Pageable pageable
    );

    CustomerDto update(UUID id,
                       CustomerRequest request);

    void deactivate(UUID id);

    List<CustomerSearchDto> search(String query);

}