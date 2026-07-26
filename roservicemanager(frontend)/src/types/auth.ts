/**
 * Shape of the JSON body we POST to /api/auth/login.
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Tenant-scoped roles. OWNER: exactly one per business, manages billing and
 * team members. ADMIN: full visibility including sales/payments/reports,
 * manages technicians. TECHNICIAN: sees only their assigned service calls
 * and the customer/asset info needed for that job, no sales/revenue
 * visibility.
 */
export type UserRole = "OWNER" | "ADMIN" | "TECHNICIAN";

/**
 * Shape of the JSON response from /api/auth/login.
 * Matches backend LoginResponse record exactly.
 */
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  username: string;
  role: UserRole;
}

/**
 * Shape of the JSON response from /api/auth/me.
 * Matches backend UserDetailsResponse record exactly.
 */
export interface CurrentUser {
  username: string;
  fullName: string;
  email: string;
  contactNumber: string;
  role: UserRole;
}
