package com.vc.roservicemanager.servicehistory.service;

import com.vc.roservicemanager.servicehistory.dto.ServiceHistoryDto;
import com.vc.roservicemanager.servicehistory.dto.ServiceHistoryRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ServiceHistoryService {

    ServiceHistoryDto create(ServiceHistoryRequest request);

    Page<ServiceHistoryDto> getByAsset(UUID customerAssetId, Pageable pageable);

    Page<ServiceHistoryDto> getByCustomer(UUID customerId, Pageable pageable);

    Page<ServiceHistoryDto> getAll(Pageable pageable);

}
