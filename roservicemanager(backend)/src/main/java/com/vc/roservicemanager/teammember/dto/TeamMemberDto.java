package com.vc.roservicemanager.teammember.dto;

import com.vc.roservicemanager.auth.entity.Role;

import java.util.UUID;

public record TeamMemberDto(

        UUID id,

        String username,

        String fullName,

        String email,

        String contactNumber,

        Role role,

        boolean enabled

) {
}
