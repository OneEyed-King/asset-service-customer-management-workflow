package com.vc.roservicemanager.customerasset.controller;
import com.vc.roservicemanager.common.utils.ApiConstants;
import com.vc.roservicemanager.customerasset.dto.CustomerAssetDto;
import com.vc.roservicemanager.customerasset.dto.CustomerAssetRequest;
import com.vc.roservicemanager.customerasset.service.CustomerAssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class CustomerAssetController {

    private final CustomerAssetService customerAssetService;

    // =========================================================
    // Create
    // =========================================================

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerAssetDto create(
            @Valid @RequestBody CustomerAssetRequest request) {

        return customerAssetService.create(request);
    }

    // =========================================================
    // Read
    // =========================================================

    @GetMapping("/{id}")
    public CustomerAssetDto getById(
            @PathVariable UUID id) {

        return customerAssetService.getById(id);
    }

    @GetMapping
    public Page<CustomerAssetDto> getAll(

            @PageableDefault(
                    size = ApiConstants.DEFAULT_PAGE_SIZE,
                    sort = "installationDate")
            Pageable pageable) {

        return customerAssetService.getAll(pageable);
    }

    @GetMapping("/due")
    public Page<CustomerAssetDto> getDueForService(

            @PageableDefault(
                    size = ApiConstants.DEFAULT_PAGE_SIZE,
                    sort = "nextServiceDate")
            Pageable pageable) {

        return customerAssetService.getDueForService(pageable);
    }

    @GetMapping("/customer/{customerId}")
    public Page<CustomerAssetDto> getByCustomer(

            @PathVariable UUID customerId,

            @PageableDefault(
                    size = 20,
                    sort = "installationDate")
            Pageable pageable) {

        return customerAssetService.getByCustomer(
                customerId,
                pageable
        );
    }

    // =========================================================
    // Update
    // =========================================================

    @PutMapping("/{id}")
    public CustomerAssetDto update(

            @PathVariable UUID id,

            @Valid @RequestBody CustomerAssetRequest request) {

        return customerAssetService.update(id, request);
    }

    // =========================================================
    // Delete
    // =========================================================

    @PatchMapping("/{id}/deactivate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(
            @PathVariable UUID id) {

        customerAssetService.deactivate(id);
    }

}