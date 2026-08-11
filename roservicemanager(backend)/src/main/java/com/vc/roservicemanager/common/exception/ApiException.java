package com.vc.roservicemanager.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown by services when a request fails for a business reason (not
 * found, conflict, seat limit reached, etc.) and needs to reach the
 * client as a specific HTTP status rather than a generic 500 - see
 * GlobalExceptionHandler.
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public static ApiException notFound(String message) {
        return new ApiException(HttpStatus.NOT_FOUND, message);
    }

    public static ApiException conflict(String message) {
        return new ApiException(HttpStatus.CONFLICT, message);
    }

    public static ApiException badRequest(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }

    public static ApiException forbidden(String message) {
        return new ApiException(HttpStatus.FORBIDDEN, message);
    }

    public HttpStatus getStatus() {
        return status;
    }
}
