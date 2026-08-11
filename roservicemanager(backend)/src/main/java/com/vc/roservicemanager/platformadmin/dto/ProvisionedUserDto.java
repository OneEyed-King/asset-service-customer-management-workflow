package com.vc.roservicemanager.platformadmin.dto;

import com.vc.roservicemanager.auth.entity.Role;

import java.util.UUID;

public record ProvisionedUserDto(

        UUID id,

        UUID tenantId,

        String username,

        String fullName,

        String email,

        String contactNumber,

        Role role,

        boolean enabled

) {
}
