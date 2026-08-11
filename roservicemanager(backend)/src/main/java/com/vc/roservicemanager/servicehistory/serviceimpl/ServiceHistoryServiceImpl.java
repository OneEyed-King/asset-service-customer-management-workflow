package com.vc.roservicemanager.servicehistory.serviceimpl;

import com.vc.roservicemanager.auth.entity.User;
import com.vc.roservicemanager.auth.repository.UserRepository;
import com.vc.roservicemanager.auth.security.CurrentTenantProvider;
import com.vc.roservicemanager.common.exception.ApiException;
import com.vc.roservicemanager.customer.serviceimpl.CustomerFinder;
import com.vc.roservicemanager.customerasset.entity.CustomerAsset;
import com.vc.roservicemanager.customerasset.repository.CustomerAssetRepository;
import com.vc.roservicemanager.servicehistory.dto.ServiceHistoryDto;
import com.vc.roservicemanager.servicehistory.dto.ServiceHistoryRequest;
import com.vc.roservicemanager.servicehistory.entity.ServiceHistory;
import com.vc.roservicemanager.servicehistory.repository.ServiceHistoryRepository;
import com.vc.roservicemanager.servicehistory.service.ServiceHistoryService;
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
public class ServiceHistoryServiceImpl implements ServiceHistoryService {

    private final ServiceHistoryRepository serviceHistoryRepository;
    private final CustomerAssetRepository customerAssetRepository;
    private final CustomerFinder customerFinder;
    private final UserRepository userRepository;
    private final CurrentTenantProvider currentTenantProvider;

    @Override
    public ServiceHistoryDto create(ServiceHistoryRequest request) {

        UUID tenantId = currentTenantProvider.getTenantId();

        CustomerAsset asset = customerAssetRepository
                .findByIdAndActiveTrueAndTenantId(request.customerAssetId(), tenantId)
                .orElseThrow(() -> ApiException.notFound("Asset not found"));

        // null/omitted means "yes, this visit got the job done" - the
        // common case, and what every record created before this field
        // existed already implicitly was.
        boolean completed = request.completed() == null || request.completed();

        LocalDate nextServiceDate;
        if (completed) {
            // If the caller didn't specify when the next service is due,
            // work it out from the asset's own service interval - "changed
            // the candle today" + "due every 30 days" = "next due in 30
            // days", without the caller having to do that math themselves.
            // Assets that aren't under a recurring service arrangement have
            // no interval to project from, so they simply get no next-due
            // date unless the caller explicitly provides one for this visit.
            nextServiceDate = request.nextServiceDate() != null
                    ? request.nextServiceDate()
                    : (asset.isUnderAmc() && asset.getServiceIntervalDays() != null)
                            ? request.serviceDate().plusDays(asset.getServiceIntervalDays())
                            : null;
        } else {
            // The visit didn't actually finish the job, so there's nothing
            // to project from - only an explicit reschedule date counts.
            // Leaving this null (rather than falling back to the interval
            // calc) is what keeps the asset showing as still due/overdue
            // below instead of silently getting pushed out.
            nextServiceDate = request.nextServiceDate();
        }

        User servicedBy = null;
        if (request.servicedById() != null) {
            servicedBy = userRepository.findByIdAndTenantId(request.servicedById(), tenantId)
                    .orElseThrow(() -> ApiException.notFound("Team member not found"));
        }

        Tenant tenantRef = new Tenant();
        tenantRef.setId(tenantId);

        ServiceHistory serviceHistory = ServiceHistory.builder()
                .tenant(tenantRef)
                .customerAsset(asset)
                .serviceDate(request.serviceDate())
                .remarks(request.remarks())
                .nextServiceDate(nextServiceDate)
                .servicedBy(servicedBy)
                .completed(completed)
                .build();

        ServiceHistory saved = serviceHistoryRepository.save(serviceHistory);

        // Roll the asset's own "next due" date forward so the Assets/Due
        // list reflects the latest visit without a separate manual edit.
        // A not-completed visit with no explicit reschedule date leaves the
        // asset's existing due date untouched - it's still due, nothing to
        // update.
        if (completed || nextServiceDate != null) {
            asset.setNextServiceDate(nextServiceDate);
            customerAssetRepository.save(asset);
        }

        log.info("Logged {} service on asset '{}', next due {}",
                completed ? "completed" : "incomplete", asset.getId(), nextServiceDate);

        return toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ServiceHistoryDto> getByAsset(UUID customerAssetId, Pageable pageable) {

        UUID tenantId = currentTenantProvider.getTenantId();

        customerAssetRepository.findByIdAndActiveTrueAndTenantId(customerAssetId, tenantId)
                .orElseThrow(() -> ApiException.notFound("Asset not found"));

        return serviceHistoryRepository
                .findByTenantIdAndCustomerAssetId(tenantId, customerAssetId, pageable)
                .map(ServiceHistoryServiceImpl::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ServiceHistoryDto> getByCustomer(UUID customerId, Pageable pageable) {

        UUID tenantId = currentTenantProvider.getTenantId();

        // Validates the customer exists and belongs to this tenant.
        customerFinder.get(customerId);

        return serviceHistoryRepository
                .findByTenantIdAndCustomerAsset_Customer_Id(tenantId, customerId, pageable)
                .map(ServiceHistoryServiceImpl::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ServiceHistoryDto> getAll(Pageable pageable) {

        UUID tenantId = currentTenantProvider.getTenantId();

        return serviceHistoryRepository
                .findByTenantId(tenantId, pageable)
                .map(ServiceHistoryServiceImpl::toDto);
    }

    // Public (not private) so DashboardServiceImpl can reuse the exact same
    // mapping for its "recent activity" feed instead of duplicating it.
    public static ServiceHistoryDto toDto(ServiceHistory serviceHistory) {

        User servicedBy = serviceHistory.getServicedBy();

        return new ServiceHistoryDto(
                serviceHistory.getId(),
                serviceHistory.getCustomerAsset().getId(),
                serviceHistory.getCustomerAsset().getName(),
                serviceHistory.getCustomerAsset().getCustomer().getId(),
                serviceHistory.getCustomerAsset().getCustomer().getName(),
                serviceHistory.getServiceDate(),
                serviceHistory.getRemarks(),
                serviceHistory.getNextServiceDate(),
                servicedBy != null ? servicedBy.getId() : null,
                servicedBy != null ? servicedBy.getFullName() : null,
                serviceHistory.isCompleted()
        );
    }

}
