package com.vc.roservicemanager.platformadmin.controller;

import com.vc.roservicemanager.common.exception.ApiException;
import com.vc.roservicemanager.platformadmin.config.PlatformAdminProperties;
import com.vc.roservicemanager.platformadmin.dto.CreateTenantRequest;
import com.vc.roservicemanager.platformadmin.dto.ProvisionUserRequest;
import com.vc.roservicemanager.platformadmin.dto.ProvisionedUserDto;
import com.vc.roservicemanager.platformadmin.dto.TenantDto;
import com.vc.roservicemanager.platformadmin.service.PlatformAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Dev-only tenant/user provisioning, replacing manual SQL/manage-tenants.sh.
 * There's no real signup flow yet, so this is how a new business and its
 * first (OWNER) user get created until that exists.
 *
 * Every endpoint here is unauthenticated by Spring Security (see
 * SecurityConfig - there's no JWT to require for a user that doesn't exist
 * yet) and instead gated by a shared secret in the X-Platform-Admin-Key
 * header, checked against `platform-admin.api-key` (env var
 * PLATFORM_ADMIN_KEY). Treat that key like a password - anyone who has it
 * can create tenants and OWNER accounts.
 */
@RestController
@RequestMapping("/api/platform-admin")
@RequiredArgsConstructor
public class PlatformAdminController {

    private static final String API_KEY_HEADER = "X-Platform-Admin-Key";

    private final PlatformAdminService platformAdminService;
    private final PlatformAdminProperties platformAdminProperties;

    @PostMapping("/tenants")
    @ResponseStatus(HttpStatus.CREATED)
    public TenantDto createTenant(
            @RequestHeader(API_KEY_HEADER) String apiKey,
            @Valid @RequestBody CreateTenantRequest request) {

        requireApiKey(apiKey);
        return platformAdminService.createTenant(request);
    }

    @GetMapping("/tenants")
    public List<TenantDto> listTenants(
            @RequestHeader(API_KEY_HEADER) String apiKey) {

        requireApiKey(apiKey);
        return platformAdminService.listTenants();
    }

    @PostMapping("/tenants/{tenantId}/users")
    @ResponseStatus(HttpStatus.CREATED)
    public ProvisionedUserDto provisionUser(
            @RequestHeader(API_KEY_HEADER) String apiKey,
            @PathVariable UUID tenantId,
            @Valid @RequestBody ProvisionUserRequest request) {

        requireApiKey(apiKey);
        return platformAdminService.provisionUser(tenantId, request);
    }

    @GetMapping("/tenants/{tenantId}/users")
    public List<ProvisionedUserDto> listUsers(
            @RequestHeader(API_KEY_HEADER) String apiKey,
            @PathVariable UUID tenantId) {

        requireApiKey(apiKey);
        return platformAdminService.listUsers(tenantId);
    }

    private void requireApiKey(String providedKey) {

        String expectedKey = platformAdminProperties.getApiKey();

        if (expectedKey == null || expectedKey.isBlank() || !expectedKey.equals(providedKey)) {
            throw ApiException.forbidden("Missing or invalid " + API_KEY_HEADER + " header.");
        }
    }

}
