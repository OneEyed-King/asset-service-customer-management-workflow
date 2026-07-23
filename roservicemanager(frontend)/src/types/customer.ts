/**
 * NOTE: the backend's Customer response does NOT currently include an
 * "active" flag or timestamps - confirmed against real API responses.
 * They're left here as optional so the UI won't break if the backend
 * adds them later, but nothing in the UI depends on them today.
 */
export interface Customer {
  id: string;
  name: string;
  contactNumber: string;
  alternateContactNumber?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerRequest {
  name: string;
  contactNumber: string;
  alternateContactNumber?: string;
  email?: string;
  address?: string;
  notes?: string;
}

/**
 * Lightweight shape returned by the autocomplete endpoint
 * (GET /api/customers/search?q=...) - deliberately trimmed down for a fast
 * "pick a customer" UX (e.g. when creating a Customer Asset).
 */
export interface CustomerAutocompleteResult {
  id: string;
  name: string;
  contactNumber: string;
}
