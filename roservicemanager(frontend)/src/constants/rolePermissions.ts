import type { UserRole } from "@/types/auth";

export interface RolePermissionInfo {
  label: string;
  summary: string;
  bullets: string[];
}

/**
 * Single source of truth for what each role can/can't do, shown to the
 * Owner whenever they're picking or changing a team member's role so the
 * choice is informed rather than a bare enum value.
 */
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissionInfo> = {
  OWNER: {
    label: "Owner",
    summary: "Full visibility plus billing and team management. Exactly one per business.",
    bullets: [
      "Everything an Admin can see and do",
      "Manages billing and subscription",
      "Adds, removes, and changes the role of team members",
    ],
  },
  ADMIN: {
    label: "Admin",
    summary: "Full visibility into sales, payments, and reports. Can manage technicians.",
    bullets: [
      "View and manage customers and assets",
      "See sales, payments, and reports",
      "Assign and manage technicians",
      "Cannot manage billing or team members",
    ],
  },
  TECHNICIAN: {
    label: "Technician",
    summary: "Sees only their assigned service calls and the info needed for that job.",
    bullets: [
      "View their own assigned service calls",
      "View customer/asset info for those jobs only",
      "Receive their own notifications",
      "No visibility into sales or revenue",
    ],
  },
};

/** Roles that can be assigned through the team member UI (OWNER excluded - see AssignableRole). */
export const ASSIGNABLE_ROLES: Array<Exclude<UserRole, "OWNER">> = ["ADMIN", "TECHNICIAN"];
