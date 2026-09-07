package com.vc.roservicemanager.payment.dto;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * The whole point of the ledger: one number the owner can look at and
 * trust. totalCharges is sold-asset purchase prices, plus AMC contract
 * prices, plus anything charged directly on a service visit (e.g. an
 * off-schedule/complaint call-out) - all for this customer; totalPaid is
 * every payment on record; balanceDue is the difference.
 */
public record CustomerLedgerSummaryDto(

        UUID customerId,

        BigDecimal totalCharges,
        BigDecimal totalPaid,
        BigDecimal balanceDue

) {
}
