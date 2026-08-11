import type { UserRole } from "@/types/auth";

/**
 * A tenant-scoped team member. Matches the backend's TeamMemberDto exactly.
 */
export interface TeamMember {
  id: string;
  username: string;
  fullName: string;
  email: string | null;
  contactNumber: string | null;
  role: UserRole;
  enabled: boolean;
}

/**
 * The OWNER role is intentionally excluded here - a tenant has exactly one
 * owner, set up outside this UI, and can't be created or reassigned through
 * the team member endpoints.
 */
export type AssignableRole = Exclude<UserRole, "OWNER">;

export interface CreateTeamMemberRequest {
  username: string;
  password: string;
  fullName: string;
  email?: string;
  contactNumber?: string;
  role: AssignableRole;
}

export interface UpdateTeamMemberRoleRequest {
  role: AssignableRole;
}

export type PlanTier = "SMALL" | "GROWING" | "MULTI_BRANCH" | "ENTERPRISE";

export interface SeatUsage {
  used: number;
  /** Null means unlimited (Enterprise or no limit configured). */
  limit: number | null;
  planTier: PlanTier;
}
