package com.vc.roservicemanager.tenant.entity;

/**
 * Lifecycle status of a tenant account. TRIAL/ACTIVE both behave the same
 * functionally today (no enforcement yet) - this exists so billing status
 * has somewhere to live once Razorpay integration and seat-limit
 * enforcement are added, without another migration.
 */
public enum TenantStatus {

    TRIAL,
    ACTIVE,
    SUSPENDED

}
