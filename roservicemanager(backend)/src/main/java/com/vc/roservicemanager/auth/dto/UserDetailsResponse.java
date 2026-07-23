package com.vc.roservicemanager.auth.dto;

import com.vc.roservicemanager.auth.entity.Role;

public record UserDetailsResponse(

        String username,

        String fullName,

        String email,

        String contactNumber,

        Role role

) {
}
