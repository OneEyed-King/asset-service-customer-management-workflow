package com.vc.roservicemanager.amc.serviceimpl;

import com.vc.roservicemanager.amc.dto.AmcContractDto;
import com.vc.roservicemanager.amc.dto.CreateAmcContractRequest;
import com.vc.roservicemanager.amc.entity.AmcContract;
import com.vc.roservicemanager.amc.repository.AmcContractRepository;
import com.vc.roservicemanager.amc.service.AmcContractService;
import com.vc.roservicemanager.auth.security.CurrentTenantProvider;
import com.vc.roservicemanager.common.enums.AmcContractStatus;
import com.vc.roservicemanager.common.exception.ApiException;
import com.vc.roservicemanager.customer.serviceimpl.CustomerFinder;
import com.vc.roservicemanager.customerasset.entity.CustomerAsset;
import com.vc.roservicemanager.customerasset.repository.CustomerAssetRepository;
import com.vc.roservicemanager.tenant.entity.Tenant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class AmcContractServiceImpl implements AmcContractService {

    private final AmcContractRepository amcContractRepository;
    private final CustomerAssetRepository customerAssetRepository;
    private final CustomerFinder customerFinder;
    private final CurrentTenantProvider currentTenantProvider;

    @Override
    public AmcContractDto create(CreateAmcContractRequest request) {

        if (!request.endDate().isAfter(request.startDate())) {
            throw ApiException.badRequest("End date must be after start date");
        }

        UUID tenantId = currentTenantProvider.getTenantId();

        CustomerAsset asset = customerAssetRepository
                .findByIdAndActiveTrueAndTenantId(request.customerAssetId(), tenantId)
                .orElseThrow(() -> ApiException.notFound("Asset not found"));

        Tenant tenantRef = new Tenant();
        tenantRef.setId(tenantId);

        AmcContract contract = AmcContract.builder()
                .tenant(tenantRef)
                .customerAsset(asset)
                .planName(request.planName())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .price(request.price())
                .visitsIncluded(request.visitsIncluded())
                .build();

        AmcContract saved = amcContractRepository.save(contract);

        log.info("Created AMC contract '{}' for asset '{}', {} to {}",
                saved.getId(), asset.getId(), request.startDate(), request.endDate());

        return toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AmcContractDto> getByAsset(UUID customerAssetId, Pageable pageable) {

        UUID tenantId = currentTenantProvider.getTenantId();

        customerAssetRepository.findByIdAndActiveTrueAndTenantId(customerAssetId, tenantId)
                .orElseThrow(() -> ApiException.notFound("Asset not found"));

        return amcContractRepository
                .findByTenantIdAndCustomerAssetId(tenantId, customerAssetId, pageable)
                .map(AmcContractServiceImpl::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AmcContractDto> getByCustomer(UUID customerId, Pageable pageable) {

        UUID tenantId = currentTenantProvider.getTenantId();

        // Validates the customer exists and belongs to this tenant.
        customerFinder.get(customerId);

        return amcContractRepository
                .findByTenantIdAndCustomerAsset_Customer_Id(tenantId, customerId, pageable)
                .map(AmcContractServiceImpl::toDto);
    }

    @Override
    public AmcContractDto cancel(UUID id) {

        UUID tenantId = currentTenantProvider.getTenantId();

        AmcContract contract = amcContractRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> ApiException.notFound("AMC contract not found"));

        contract.setStatus(AmcContractStatus.CANCELLED);
        AmcContract saved = amcContractRepository.save(contract);

        log.info("Cancelled AMC contract '{}'", id);

        return toDto(saved);
    }

    // Public (not private) so other modules (e.g. a future ledger/reporting
    // service) can reuse the exact same mapping, same convention as
    // ServiceHistoryServiceImpl.toDto.
    public static AmcContractDto toDto(AmcContract contract) {

        boolean expired = contract.getStatus() == AmcContractStatus.ACTIVE
                && contract.getEndDate().isBefore(LocalDate.now());

        return new AmcContractDto(
                contract.getId(),
                contract.getCustomerAsset().getId(),
                contract.getCustomerAsset().getName(),
                contract.getCustomerAsset().getCustomer().getId(),
                contract.getCustomerAsset().getCustomer().getName(),
                contract.getPlanName(),
                contract.getStartDate(),
                contract.getEndDate(),
                contract.getPrice(),
                contract.getVisitsIncluded(),
                contract.getStatus(),
                expired
        );
    }

}
