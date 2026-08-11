package com.vc.roservicemanager.auth.repository;

import com.vc.roservicemanager.auth.entity.Role;
import com.vc.roservicemanager.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    List<User> findByTenantId(UUID tenantId);

    Optional<User> findByIdAndTenantId(UUID id, UUID tenantId);

    long countByTenantIdAndEnabledTrue(UUID tenantId);

    boolean existsByTenantIdAndRoleAndEnabledTrue(UUID tenantId, Role role);

}