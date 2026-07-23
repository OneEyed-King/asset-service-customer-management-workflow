package com.vc.roservicemanager.customer.controller;

import com.vc.roservicemanager.customer.dto.CustomerDto;
import com.vc.roservicemanager.customer.dto.CustomerRequest;
import com.vc.roservicemanager.customer.dto.CustomerSearchDto;
import com.vc.roservicemanager.customer.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerDto create(
            @Valid @RequestBody CustomerRequest request) {

        return customerService.create(request);
    }

    @GetMapping("/{id}")
    public CustomerDto getById(@PathVariable UUID id) {

        return customerService.getById(id);
    }

    @GetMapping
    public Page<CustomerDto> getAll(

            @RequestParam(required = false) String search,

            @PageableDefault(
                    size = 20,
                    sort = "name")
            Pageable pageable) {

        return customerService.getAll(search, pageable);
    }

    @GetMapping("/search")
    public List<CustomerSearchDto> search(
            @RequestParam String q) {

        return customerService.search(q);
    }

    @PutMapping("/{id}")
    public CustomerDto update(
            @PathVariable UUID id,
            @Valid @RequestBody CustomerRequest request) {

        return customerService.update(id, request);
    }

    @PatchMapping("/{id}/deactivate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable UUID id) {

        customerService.deactivate(id);
    }

}