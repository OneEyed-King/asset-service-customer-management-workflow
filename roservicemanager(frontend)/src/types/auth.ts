/**
 * Shape of the JSON body we POST to /api/auth/login.
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Shape of the JSON response from /api/auth/login.
 */
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  username: string;
  role: string;
}

/**
 * Shape of the JSON response from /api/auth/me (WhoAmI).
 */
export interface CurrentUser {
  username: string;
  role?: string;
}
