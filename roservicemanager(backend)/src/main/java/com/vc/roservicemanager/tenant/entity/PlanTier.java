package com.vc.roservicemanager.tenant.entity;

/**
 * Subscription tier a business is on. Pricing/seat limits for each tier are
 * a business decision, not hardcoded here - the actual seat count lives on
 * the Tenant row itself (seatLimit) so it can be adjusted per-account
 * (e.g. a manually negotiated Enterprise deal) without a code change.
 */
public enum PlanTier {

    SMALL,
    GROWING,
    MULTI_BRANCH,
    ENTERPRISE

}
