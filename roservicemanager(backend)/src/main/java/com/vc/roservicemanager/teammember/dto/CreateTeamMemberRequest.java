package com.vc.roservicemanager.teammember.dto;

import com.vc.roservicemanager.auth.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateTeamMemberRequest(

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

        // OWNER is intentionally not accepted here - a tenant's OWNER is
        // set up once (see manage-tenants.sh) and can't be created or
        // reassigned through this endpoint, since a tenant may only ever
        // have exactly one.
        @NotNull
        Role role

) {
}
