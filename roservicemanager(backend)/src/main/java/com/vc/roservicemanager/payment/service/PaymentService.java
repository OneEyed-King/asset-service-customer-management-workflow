package com.vc.roservicemanager.payment.service;

import com.vc.roservicemanager.payment.dto.CreatePaymentRequest;
import com.vc.roservicemanager.payment.dto.CustomerLedgerSummaryDto;
import com.vc.roservicemanager.payment.dto.PaymentDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PaymentService {

    PaymentDto create(CreatePaymentRequest request);

    Page<PaymentDto> getByCustomer(UUID customerId, Pageable pageable);

    CustomerLedgerSummaryDto getLedgerSummary(UUID customerId);

}
