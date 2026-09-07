package com.vc.roservicemanager.payment.controller;

import com.vc.roservicemanager.common.utils.ApiConstants;
import com.vc.roservicemanager.payment.dto.CreatePaymentRequest;
import com.vc.roservicemanager.payment.dto.CustomerLedgerSummaryDto;
import com.vc.roservicemanager.payment.dto.PaymentDto;
import com.vc.roservicemanager.payment.service.PaymentService;
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
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentDto create(@Valid @RequestBody CreatePaymentRequest request) {
        return paymentService.create(request);
    }

    @GetMapping("/customer/{customerId}")
    public Page<PaymentDto> getByCustomer(

            @PathVariable UUID customerId,

            @PageableDefault(
                    size = ApiConstants.DEFAULT_PAGE_SIZE,
                    sort = "paymentDate",
                    direction = Sort.Direction.DESC)
            Pageable pageable) {

        return paymentService.getByCustomer(customerId, pageable);
    }

    @GetMapping("/customer/{customerId}/summary")
    public CustomerLedgerSummaryDto getLedgerSummary(@PathVariable UUID customerId) {
        return paymentService.getLedgerSummary(customerId);
    }

}
