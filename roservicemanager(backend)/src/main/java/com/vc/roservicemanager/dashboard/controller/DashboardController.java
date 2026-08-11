package com.vc.roservicemanager.dashboard.controller;

import com.vc.roservicemanager.dashboard.dto.DashboardSummaryDto;
import com.vc.roservicemanager.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public DashboardSummaryDto getSummary() {
        return dashboardService.getSummary();
    }

}
