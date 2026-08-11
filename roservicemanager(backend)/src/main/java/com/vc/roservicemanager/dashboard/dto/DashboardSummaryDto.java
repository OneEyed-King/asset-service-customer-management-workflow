package com.vc.roservicemanager.dashboard.dto;

import com.vc.roservicemanager.servicehistory.dto.ServiceHistoryDto;

import java.util.List;

/**
 * Everything the dashboard's landing page needs in one round-trip: headline
 * counts, the list of assets due/overdue for service, and a short feed of
 * recently logged visits.
 */
public record DashboardSummaryDto(

        long totalCustomers,
        long totalAssets,
        long assetsUnderAmc,

        // "Overdue" = nextServiceDate before today. "Due soon" = within the
        // next 7 days (inclusive), not yet overdue.
        long overdueServiceCount,
        long dueSoonServiceCount,

        List<UpcomingServiceDto> upcomingServices,

        List<ServiceHistoryDto> recentActivity

) {
}
