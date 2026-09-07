package com.vc.roservicemanager.amc.service;

import com.vc.roservicemanager.amc.dto.AmcContractDto;
import com.vc.roservicemanager.amc.dto.CreateAmcContractRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface AmcContractService {

    AmcContractDto create(CreateAmcContractRequest request);

    Page<AmcContractDto> getByAsset(UUID customerAssetId, Pageable pageable);

    Page<AmcContractDto> getByCustomer(UUID customerId, Pageable pageable);

    AmcContractDto cancel(UUID id);

}
