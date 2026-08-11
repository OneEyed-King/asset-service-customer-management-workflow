package com.vc.roservicemanager.dashboard.serviceimpl;

import com.vc.roservicemanager.auth.security.CurrentTenantProvider;
import com.vc.roservicemanager.customer.repository.CustomerRepository;
import com.vc.roservicemanager.customerasset.entity.CustomerAsset;
import com.vc.roservicemanager.customerasset.repository.CustomerAssetRepository;
import com.vc.roservicemanager.dashboard.dto.DashboardSummaryDto;
import com.vc.roservicemanager.dashboard.dto.UpcomingServiceDto;
import com.vc.roservicemanager.dashboard.service.DashboardService;
import com.vc.roservicemanager.servicehistory.dto.ServiceHistoryDto;
import com.vc.roservicemanager.servicehistory.repository.ServiceHistoryRepository;
import com.vc.roservicemanager.servicehistory.serviceimpl.ServiceHistoryServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    // Caps on the two "list" sections - a dashboard is a summary, not a
    // full report, so both are deliberately short.
    private static final int UPCOMING_SERVICES_LIMIT = 10;
    private static final int RECENT_ACTIVITY_LIMIT = 5;
    private static final int DUE_SOON_WINDOW_DAYS = 7;

    private final CustomerRepository customerRepository;
    private final CustomerAssetRepository customerAssetRepository;
    private final ServiceHistoryRepository serviceHistoryRepository;
    private final CurrentTenantProvider currentTenantProvider;

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryDto getSummary() {

        UUID tenantId = currentTenantProvider.getTenantId();
        LocalDate today = LocalDate.now();
        LocalDate dueSoonEnd = today.plusDays(DUE_SOON_WINDOW_DAYS);

        long totalCustomers = customerRepository.countByActiveTrueAndTenantId(tenantId);
        long totalAssets = customerAssetRepository.countByActiveTrueAndTenantId(tenantId);
        long assetsUnderAmc = customerAssetRepository.countByActiveTrueAndTenantIdAndUnderAmcTrue(tenantId);

        long overdueCount = customerAssetRepository
                .countByActiveTrueAndTenantIdAndUnderAmcTrueAndNextServiceDateLessThan(tenantId, today);
        long dueSoonCount = customerAssetRepository
                .countByActiveTrueAndTenantIdAndUnderAmcTrueAndNextServiceDateBetween(tenantId, today, dueSoonEnd);

        List<CustomerAsset> upcomingAssets = customerAssetRepository
                .findByActiveTrueAndTenantIdAndUnderAmcTrueAndNextServiceDateIsNotNullOrderByNextServiceDateAsc(
                        tenantId, PageRequest.of(0, UPCOMING_SERVICES_LIMIT));

        List<UpcomingServiceDto> upcomingServices = upcomingAssets.stream()
                .map(asset -> new UpcomingServiceDto(
                        asset.getId(),
                        asset.getName(),
                        asset.getCustomer().getId(),
                        asset.getCustomer().getName(),
                        asset.getNextServiceDate(),
                        asset.getNextServiceDate().isBefore(today),
                        asset.getServiceIntervalDays()
                ))
                .toList();

        List<ServiceHistoryDto> recentActivity = serviceHistoryRepository
                .findByTenantIdOrderByServiceDateDescCreatedAtDesc(tenantId, PageRequest.of(0, RECENT_ACTIVITY_LIMIT))
                .stream()
                .map(ServiceHistoryServiceImpl::toDto)
                .toList();

        return new DashboardSummaryDto(
                totalCustomers,
                totalAssets,
                assetsUnderAmc,
                overdueCount,
                dueSoonCount,
                upcomingServices,
                recentActivity
        );
    }

}
