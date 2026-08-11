package com.vc.roservicemanager.teammember.serviceimpl;

import com.vc.roservicemanager.auth.entity.Role;
import com.vc.roservicemanager.auth.entity.User;
import com.vc.roservicemanager.auth.repository.UserRepository;
import com.vc.roservicemanager.auth.security.CurrentTenantProvider;
import com.vc.roservicemanager.common.exception.ApiException;
import com.vc.roservicemanager.teammember.dto.CreateTeamMemberRequest;
import com.vc.roservicemanager.teammember.dto.SeatUsageDto;
import com.vc.roservicemanager.teammember.dto.TeamMemberDto;
import com.vc.roservicemanager.teammember.dto.UpdateTeamMemberRoleRequest;
import com.vc.roservicemanager.teammember.service.TeamMemberService;
import com.vc.roservicemanager.tenant.entity.Tenant;
import com.vc.roservicemanager.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class TeamMemberServiceImpl implements TeamMemberService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final CurrentTenantProvider currentTenantProvider;
    private final PasswordEncoder passwordEncoder;

    // =========================================================
    // Read
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<TeamMemberDto> list() {

        UUID tenantId = currentTenantProvider.getTenantId();

        return userRepository.findByTenantId(tenantId).stream()
                // OWNER first, then ADMIN, then TECHNICIAN (declaration order of the enum),
                // alphabetical within each role.
                .sorted(Comparator.comparing((User u) -> u.getRole().ordinal())
                        .thenComparing(User::getUsername))
                .map(TeamMemberServiceImpl::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SeatUsageDto seatUsage() {

        UUID tenantId = currentTenantProvider.getTenantId();
        Tenant tenant = getTenant(tenantId);

        long used = userRepository.countByTenantIdAndEnabledTrue(tenantId);

        return new SeatUsageDto((int) used, tenant.getSeatLimit(), tenant.getPlanTier());
    }

    // =========================================================
    // Create
    // =========================================================

    @Override
    public TeamMemberDto create(CreateTeamMemberRequest request) {

        UUID tenantId = currentTenantProvider.getTenantId();
        Tenant tenant = getTenant(tenantId);

        if (request.role() == Role.OWNER) {
            throw ApiException.badRequest(
                    "A team member can't be created as OWNER. A tenant has exactly one owner, set up when the tenant is created.");
        }

        long currentSeats = userRepository.countByTenantIdAndEnabledTrue(tenantId);

        if (tenant.getSeatLimit() != null && currentSeats >= tenant.getSeatLimit()) {
            throw ApiException.conflict(
                    "Seat limit reached (" + currentSeats + "/" + tenant.getSeatLimit()
                            + "). Deactivate a team member or increase the plan's seat limit first.");
        }

        if (userRepository.existsByUsername(request.username())) {
            throw ApiException.conflict("Username '" + request.username() + "' is already taken.");
        }

        // Reference-only Tenant: Tenant uses a plain Lombok @Builder (not
        // @SuperBuilder), so its builder doesn't expose the inherited
        // BaseEntity `id` field. Setting it via the inherited setter gives
        // JPA just enough of a managed reference to persist the FK without
        // an extra round-trip to load the full Tenant row.
        Tenant tenantRef = new Tenant();
        tenantRef.setId(tenantId);

        User user = User.builder()
                .tenant(tenantRef)
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .email(request.email())
                .contactNumber(request.contactNumber())
                .role(request.role())
                .enabled(true)
                .build();

        User saved = userRepository.save(user);

        log.info("Created team member '{}' ({}) in tenant {}", saved.getUsername(), saved.getRole(), tenantId);

        return toDto(saved);
    }

    // =========================================================
    // Update role
    // =========================================================

    @Override
    public TeamMemberDto updateRole(UUID id, UpdateTeamMemberRoleRequest request) {

        UUID tenantId = currentTenantProvider.getTenantId();
        User user = getTeamMember(id, tenantId);

        if (user.getRole() == Role.OWNER || request.role() == Role.OWNER) {
            throw ApiException.badRequest(
                    "The OWNER role can't be reassigned through this endpoint. A tenant has exactly one owner.");
        }

        user.setRole(request.role());

        User saved = userRepository.save(user);

        log.info("Updated team member '{}' to role {}", saved.getUsername(), saved.getRole());

        return toDto(saved);
    }

    // =========================================================
    // Deactivate / Activate
    // =========================================================

    @Override
    public void deactivate(UUID id) {

        UUID tenantId = currentTenantProvider.getTenantId();
        User user = getTeamMember(id, tenantId);

        if (user.getRole() == Role.OWNER) {
            throw ApiException.badRequest("The OWNER can't be deactivated.");
        }

        user.setEnabled(false);
        userRepository.save(user);

        log.info("Deactivated team member '{}'", user.getUsername());
    }

    @Override
    public TeamMemberDto activate(UUID id) {

        UUID tenantId = currentTenantProvider.getTenantId();
        Tenant tenant = getTenant(tenantId);
        User user = getTeamMember(id, tenantId);

        long currentSeats = userRepository.countByTenantIdAndEnabledTrue(tenantId);

        if (tenant.getSeatLimit() != null && currentSeats >= tenant.getSeatLimit()) {
            throw ApiException.conflict(
                    "Seat limit reached (" + currentSeats + "/" + tenant.getSeatLimit()
                            + "). Deactivate another team member or increase the plan's seat limit first.");
        }

        user.setEnabled(true);

        User saved = userRepository.save(user);

        log.info("Reactivated team member '{}'", saved.getUsername());

        return toDto(saved);
    }

    // =========================================================
    // Private Helpers
    // =========================================================

    private Tenant getTenant(UUID tenantId) {

        return tenantRepository.findById(tenantId)
                .orElseThrow(() -> ApiException.notFound("Tenant not found"));
    }

    private User getTeamMember(UUID id, UUID tenantId) {

        return userRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> ApiException.notFound("Team member not found"));
    }

    private static TeamMemberDto toDto(User user) {

        return new TeamMemberDto(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getContactNumber(),
                user.getRole(),
                user.isEnabled()
        );
    }

}
