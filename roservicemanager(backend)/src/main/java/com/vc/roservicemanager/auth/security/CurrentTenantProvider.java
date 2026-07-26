package com.vc.roservicemanager.auth.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Single place every tenant-scoped service/repository call goes through to
 * find out "which business is this request for." Reads it off the
 * currently authenticated user rather than threading a tenantId parameter
 * through every controller method by hand.
 *
 * This works safely per-request because the JWT filter re-authenticates
 * on every incoming request (the app is stateless - see SecurityConfig's
 * SessionCreationPolicy.STATELESS), so Spring Security's per-request
 * SecurityContext always reflects the current request's user, never a
 * stale one from a previous request.
 */
@Component
public class CurrentTenantProvider {

    public UUID getTenantId() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !(authentication.getPrincipal() instanceof AuthenticatedUser authenticatedUser)) {

            throw new IllegalStateException(
                    "No authenticated tenant context available for this request");
        }

        return authenticatedUser.getTenantId();
    }
}
