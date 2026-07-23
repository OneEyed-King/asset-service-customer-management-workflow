/**
 * Generic Spring Data page wrapper.
 * Spring Boot's Pageable/Page<T> serializes to this shape whenever an
 * endpoint supports ?page=&size= pagination (e.g. GET /api/customers).
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page index (0-based)
  size: number; // page size
  first: boolean;
  last: boolean;
}

/**
 * Standard shape we assume for backend error bodies.
 * Spring Boot's default error responses generally look like this, and any
 * custom @ControllerAdvice error body should be kept compatible with it.
 */
export interface ApiErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
}
