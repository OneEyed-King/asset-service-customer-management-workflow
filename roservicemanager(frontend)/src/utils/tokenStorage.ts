/**
 * Small wrapper around localStorage so the rest of the app never touches
 * `localStorage` directly. If we ever swap storage strategy (e.g. to an
 * httpOnly cookie), this is the only file that changes.
 */
const TOKEN_KEY = "asm_auth_token";

export const tokenStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
};
