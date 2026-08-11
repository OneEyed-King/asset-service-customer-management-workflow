package com.vc.roservicemanager.platformadmin.dto;

import com.vc.roservicemanager.auth.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Unlike teammember/dto/CreateTeamMemberRequest, this DOES allow role=OWNER
 * - provisioning a tenant's first user is exactly when an OWNER needs to
 * be created. The one-owner-per-tenant rule is still enforced in the
 * service layer either way.
 */
public record ProvisionUserRequest(

        @NotBlank
        @Size(min = 3, max = 50)
        String username,

        @NotBlank
        @Size(min = 8, message = "Password must be at least 8 characters")
        String password,

        @NotBlank
        String fullName,

        @Email
        String email,

        String contactNumber,

        @NotNull
        Role role

) {
}
