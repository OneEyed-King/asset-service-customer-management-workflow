package com.vc.roservicemanager.platformadmin.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Shared-secret key gating the platform-admin provisioning endpoints
 * (/api/platform-admin/**). These endpoints create tenants and their
 * first (OWNER) user, so they can't require a JWT the way every other
 * endpoint does - there's no user yet to issue one to. Until a real
 * platform Super Admin auth surface exists, a static key passed via the
 * X-Platform-Admin-Key header is the gate instead.
 *
 * Dev-only: the default key is intentionally obvious so nobody mistakes
 * it for something safe to expose publicly - set PLATFORM_ADMIN_KEY to a
 * real secret before this is reachable from anywhere but your own machine.
 */
@ConfigurationProperties(prefix = "platform-admin")
@Getter
@Setter
public class PlatformAdminProperties {

    private String apiKey;

}
