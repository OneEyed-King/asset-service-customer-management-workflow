package com.vc.roservicemanager.auth.dto;

import com.vc.roservicemanager.auth.entity.Role;

public record LoginResponse(
        String accessToken,
        String tokenType,
        String username,
        Role role
) {}
