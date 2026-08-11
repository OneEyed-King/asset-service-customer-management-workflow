package com.vc.roservicemanager.servicehistory.controller;

import com.vc.roservicemanager.common.utils.ApiConstants;
import com.vc.roservicemanager.servicehistory.dto.ServiceHistoryDto;
import com.vc.roservicemanager.servicehistory.dto.ServiceHistoryRequest;
import com.vc.roservicemanager.servicehistory.service.ServiceHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/service-history")
@RequiredArgsConstructor
public class ServiceHistoryController {

    private final ServiceHistoryService serviceHistoryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceHistoryDto create(
            @Valid @RequestBody ServiceHistoryRequest request) {

        return serviceHistoryService.create(request);
    }

    @GetMapping
    public Page<ServiceHistoryDto> getAll(

            @PageableDefault(
                    size = ApiConstants.DEFAULT_PAGE_SIZE,
                    sort = "serviceDate",
                    direction = Sort.Direction.DESC)
            Pageable pageable) {

        return serviceHistoryService.getAll(pageable);
    }

    @GetMapping("/asset/{customerAssetId}")
    public Page<ServiceHistoryDto> getByAsset(

            @PathVariable UUID customerAssetId,

            @PageableDefault(
                    size = ApiConstants.DEFAULT_PAGE_SIZE,
                    sort = "serviceDate",
                    direction = Sort.Direction.DESC)
            Pageable pageable) {

        return serviceHistoryService.getByAsset(customerAssetId, pageable);
    }

    @GetMapping("/customer/{customerId}")
    public Page<ServiceHistoryDto> getByCustomer(

            @PathVariable UUID customerId,

            @PageableDefault(
                    size = ApiConstants.DEFAULT_PAGE_SIZE,
                    sort = "serviceDate",
                    direction = Sort.Direction.DESC)
            Pageable pageable) {

        return serviceHistoryService.getByCustomer(customerId, pageable);
    }

}
