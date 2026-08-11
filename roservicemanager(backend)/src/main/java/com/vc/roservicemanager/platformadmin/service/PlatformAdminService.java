package com.vc.roservicemanager.platformadmin.service;

import com.vc.roservicemanager.platformadmin.dto.CreateTenantRequest;
import com.vc.roservicemanager.platformadmin.dto.ProvisionUserRequest;
import com.vc.roservicemanager.platformadmin.dto.ProvisionedUserDto;
import com.vc.roservicemanager.platformadmin.dto.TenantDto;

import java.util.List;
import java.util.UUID;

public interface PlatformAdminService {

    TenantDto createTenant(CreateTenantRequest request);

    List<TenantDto> listTenants();

    ProvisionedUserDto provisionUser(UUID tenantId, ProvisionUserRequest request);

    List<ProvisionedUserDto> listUsers(UUID tenantId);

}
