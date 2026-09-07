package com.vc.roservicemanager.common.enums;

/**
 * Deliberately just ACTIVE/CANCELLED, not EXPIRED - "expired" is derived
 * from endDate vs today at read time (see AmcContractDto.expired), so there's
 * no background job needed to keep a stored status in sync with the
 * calendar. CANCELLED is the only state that actually needs a human
 * decision behind it.
 */
public enum AmcContractStatus {
    ACTIVE,
    CANCELLED
}
