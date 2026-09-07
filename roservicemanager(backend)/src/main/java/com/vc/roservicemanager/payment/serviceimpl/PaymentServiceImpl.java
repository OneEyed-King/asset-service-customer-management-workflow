package com.vc.roservicemanager.payment.serviceimpl;

import com.vc.roservicemanager.amc.entity.AmcContract;
import com.vc.roservicemanager.amc.repository.AmcContractRepository;
import com.vc.roservicemanager.auth.entity.User;
import com.vc.roservicemanager.auth.repository.UserRepository;
import com.vc.roservicemanager.auth.security.CurrentTenantProvider;
import com.vc.roservicemanager.common.exception.ApiException;
import com.vc.roservicemanager.customer.entity.Customer;
import com.vc.roservicemanager.customer.serviceimpl.CustomerFinder;
import com.vc.roservicemanager.customerasset.entity.CustomerAsset;
import com.vc.roservicemanager.customerasset.repository.CustomerAssetRepository;
import com.vc.roservicemanager.payment.dto.CreatePaymentRequest;
import com.vc.roservicemanager.payment.dto.CustomerLedgerSummaryDto;
import com.vc.roservicemanager.payment.dto.PaymentDto;
import com.vc.roservicemanager.payment.entity.Payment;
import com.vc.roservicemanager.payment.repository.PaymentRepository;
import com.vc.roservicemanager.payment.service.PaymentService;
import com.vc.roservicemanager.servicehistory.repository.ServiceHistoryRepository;
import com.vc.roservicemanager.tenant.entity.Tenant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final CustomerAssetRepository customerAssetRepository;
    private final AmcContractRepository amcContractRepository;
    private final ServiceHistoryRepository serviceHistoryRepository;
    private final CustomerFinder customerFinder;
    private final UserRepository userRepository;
    private final CurrentTenantProvider currentTenantProvider;

    @Override
    public PaymentDto create(CreatePaymentRequest request) {

        UUID tenantId = currentTenantProvider.getTenantId();

        // Validates the customer exists and belongs to this tenant.
        Customer customer = customerFinder.get(request.customerId());

        CustomerAsset asset = null;
        if (request.customerAssetId() != null) {
            asset = customerAssetRepository
                    .findByIdAndActiveTrueAndTenantId(request.customerAssetId(), tenantId)
                    .orElseThrow(() -> ApiException.notFound("Asset not found"));
        }

        AmcContract amcContract = null;
        if (request.amcContractId() != null) {
            amcContract = amcContractRepository.findByIdAndTenantId(request.amcContractId(), tenantId)
                    .orElseThrow(() -> ApiException.notFound("AMC contract not found"));
        }

        User recordedBy = null;
        if (request.recordedById() != null) {
            recordedBy = userRepository.findByIdAndTenantId(request.recordedById(), tenantId)
                    .orElseThrow(() -> ApiException.notFound("Team member not found"));
        }

        Tenant tenantRef = new Tenant();
        tenantRef.setId(tenantId);

        Payment payment = Payment.builder()
                .tenant(tenantRef)
                .customer(customer)
                .customerAsset(asset)
                .amcContract(amcContract)
                .amount(request.amount())
                .paymentDate(request.paymentDate())
                .method(request.method())
                .referenceNote(request.referenceNote())
                .recordedBy(recordedBy)
                .build();

        Payment saved = paymentRepository.save(payment);

        log.info("Recorded payment '{}' of {} for customer '{}'",
                saved.getId(), request.amount(), customer.getId());

        return toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentDto> getByCustomer(UUID customerId, Pageable pageable) {

        UUID tenantId = currentTenantProvider.getTenantId();

        // Validates the customer exists and belongs to this tenant.
        customerFinder.get(customerId);

        return paymentRepository
                .findByTenantIdAndCustomerId(tenantId, customerId, pageable)
                .map(PaymentServiceImpl::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerLedgerSummaryDto getLedgerSummary(UUID customerId) {

        UUID tenantId = currentTenantProvider.getTenantId();

        // Validates the customer exists and belongs to this tenant.
        customerFinder.get(customerId);

        BigDecimal assetCharges = customerAssetRepository.sumPurchasePriceByCustomer(tenantId, customerId);
        BigDecimal amcCharges = amcContractRepository.sumPriceByCustomer(tenantId, customerId);
        BigDecimal serviceCharges = serviceHistoryRepository.sumAmountChargedByCustomer(tenantId, customerId);
        BigDecimal totalCharges = assetCharges.add(amcCharges).add(serviceCharges);

        BigDecimal totalPaid = paymentRepository.sumAmountByCustomer(tenantId, customerId);

        return new CustomerLedgerSummaryDto(
                customerId,
                totalCharges,
                totalPaid,
                totalCharges.subtract(totalPaid)
        );
    }

    public static PaymentDto toDto(Payment payment) {

        CustomerAsset asset = payment.getCustomerAsset();
        AmcContract amcContract = payment.getAmcContract();
        User recordedBy = payment.getRecordedBy();

        return new PaymentDto(
                payment.getId(),
                payment.getCustomer().getId(),
                payment.getCustomer().getName(),
                asset != null ? asset.getId() : null,
                asset != null ? asset.getName() : null,
                amcContract != null ? amcContract.getId() : null,
                amcContract != null ? amcContract.getPlanName() : null,
                payment.getAmount(),
                payment.getPaymentDate(),
                payment.getMethod(),
                payment.getReferenceNote(),
                recordedBy != null ? recordedBy.getId() : null,
                recordedBy != null ? recordedBy.getFullName() : null
        );
    }

}
