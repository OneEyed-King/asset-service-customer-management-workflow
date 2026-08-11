package com.vc.roservicemanager.platformadmin.serviceimpl;

import com.vc.roservicemanager.auth.entity.Role;
import com.vc.roservicemanager.auth.entity.User;
import com.vc.roservicemanager.auth.repository.UserRepository;
import com.vc.roservicemanager.common.exception.ApiException;
import com.vc.roservicemanager.platformadmin.dto.CreateTenantRequest;
import com.vc.roservicemanager.platformadmin.dto.ProvisionUserRequest;
import com.vc.roservicemanager.platformadmin.dto.ProvisionedUserDto;
import com.vc.roservicemanager.platformadmin.dto.TenantDto;
import com.vc.roservicemanager.platformadmin.service.PlatformAdminService;
import com.vc.roservicemanager.tenant.entity.Tenant;
import com.vc.roservicemanager.tenant.entity.TenantStatus;
import com.vc.roservicemanager.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PlatformAdminServiceImpl implements PlatformAdminService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // =========================================================
    // Tenants
    // =========================================================

    @Override
    public TenantDto createTenant(CreateTenantRequest request) {

        boolean nameTaken = tenantRepository.findAll().stream()
                .anyMatch(tenant -> tenant.getBusinessName().equalsIgnoreCase(request.businessName()));

        if (nameTaken) {
            throw ApiException.conflict("A tenant named '" + request.businessName() + "' already exists.");
        }

        Tenant tenant = Tenant.builder()
                .businessName(request.businessName())
                .planTier(request.planTier())
                .status(request.status() != null ? request.status() : TenantStatus.ACTIVE)
                .seatLimit(request.seatLimit())
                .build();

        Tenant saved = tenantRepository.save(tenant);

        log.info("Provisioned tenant '{}' ({})", saved.getBusinessName(), saved.getId());

        return toTenantDto(saved, 0);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TenantDto> listTenants() {

        return tenantRepository.findAll().stream()
                .map(tenant -> toTenantDto(
                        tenant,
                        (int) userRepository.countByTenantIdAndEnabledTrue(tenant.getId())))
                .toList();
    }

    // =========================================================
    // Users
    // =========================================================

    @Override
    public ProvisionedUserDto provisionUser(UUID tenantId, ProvisionUserRequest request) {

        Tenant tenant = getTenant(tenantId);

        long currentSeats = userRepository.countByTenantIdAndEnabledTrue(tenantId);

        if (tenant.getSeatLimit() != null && currentSeats >= tenant.getSeatLimit()) {
            throw ApiException.conflict(
                    "Tenant is at its seat limit (" + currentSeats + "/" + tenant.getSeatLimit() + ").");
        }

        if (request.role() == Role.OWNER
                && userRepository.existsByTenantIdAndRoleAndEnabledTrue(tenantId, Role.OWNER)) {
            throw ApiException.conflict("This tenant already has an OWNER. A tenant can only have one.");
        }

        if (userRepository.existsByUsername(request.username())) {
            throw ApiException.conflict("Username '" + request.username() + "' is already taken.");
        }

        User user = User.builder()
                .tenant(tenant)
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .email(request.email())
                .contactNumber(request.contactNumber())
                .role(request.role())
                .enabled(true)
                .build();

        User saved = userRepository.save(user);

        log.info("Provisioned user '{}' ({}) in tenant {}", saved.getUsername(), saved.getRole(), tenantId);

        return toUserDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProvisionedUserDto> listUsers(UUID tenantId) {

        getTenant(tenantId);

        return userRepository.findByTenantId(tenantId).stream()
                .map(PlatformAdminServiceImpl::toUserDto)
                .toList();
    }

    // =========================================================
    // Private Helpers
    // =========================================================

    private Tenant getTenant(UUID tenantId) {

        return tenantRepository.findById(tenantId)
                .orElseThrow(() -> ApiException.notFound("Tenant not found"));
    }

    private static TenantDto toTenantDto(Tenant tenant, int seatsUsed) {

        return new TenantDto(
                tenant.getId(),
                tenant.getBusinessName(),
                tenant.getPlanTier(),
                tenant.getStatus(),
                tenant.getSeatLimit(),
                seatsUsed
        );
    }

    private static ProvisionedUserDto toUserDto(User user) {

        return new ProvisionedUserDto(
                user.getId(),
                user.getTenant().getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getContactNumber(),
                user.getRole(),
                user.isEnabled()
        );
    }

}
