package com.vc.roservicemanager.teammember.dto;

import com.vc.roservicemanager.auth.entity.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateTeamMemberRoleRequest(

        @NotNull
        Role role

) {
}
