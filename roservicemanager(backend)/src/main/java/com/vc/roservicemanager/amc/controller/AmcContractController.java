package com.vc.roservicemanager.amc.controller;

import com.vc.roservicemanager.amc.dto.AmcContractDto;
import com.vc.roservicemanager.amc.dto.CreateAmcContractRequest;
import com.vc.roservicemanager.amc.service.AmcContractService;
import com.vc.roservicemanager.common.utils.ApiConstants;
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
@RequestMapping("/api/amc-contracts")
@RequiredArgsConstructor
public class AmcContractController {

    private final AmcContractService amcContractService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AmcContractDto create(@Valid @RequestBody CreateAmcContractRequest request) {
        return amcContractService.create(request);
    }

    @GetMapping("/asset/{customerAssetId}")
    public Page<AmcContractDto> getByAsset(

            @PathVariable UUID customerAssetId,

            @PageableDefault(
                    size = ApiConstants.DEFAULT_PAGE_SIZE,
                    sort = "startDate",
                    direction = Sort.Direction.DESC)
            Pageable pageable) {

        return amcContractService.getByAsset(customerAssetId, pageable);
    }

    @GetMapping("/customer/{customerId}")
    public Page<AmcContractDto> getByCustomer(

            @PathVariable UUID customerId,

            @PageableDefault(
                    size = ApiConstants.DEFAULT_PAGE_SIZE,
                    sort = "startDate",
                    direction = Sort.Direction.DESC)
            Pageable pageable) {

        return amcContractService.getByCustomer(customerId, pageable);
    }

    @PatchMapping("/{id}/cancel")
    public AmcContractDto cancel(@PathVariable UUID id) {
        return amcContractService.cancel(id);
    }

}
