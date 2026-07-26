package com.vc.roservicemanager.auth.entity;

/**
 * Per-tenant role. Every tenant has exactly one OWNER (the account that
 * signed up, the only one who can manage billing and add/remove other
 * team members). ADMIN and TECHNICIAN are both assigned freely by the
 * owner - the platform doesn't enforce how many of each a tenant has,
 * only a total team-member seat count (Tenant.seatLimit).
 *
 * ADMIN: full visibility into customers, assets, service history, and
 * sales/payments; can manage technicians.
 *
 * TECHNICIAN: sees only their assigned service calls and the customer /
 * asset info needed to complete them, plus their own notifications - no
 * sales or revenue visibility.
 */
public enum Role {

    OWNER,
    ADMIN,
    TECHNICIAN

}
