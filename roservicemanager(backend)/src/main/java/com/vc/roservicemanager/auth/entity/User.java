package com.vc.roservicemanager.auth.entity;

import com.vc.roservicemanager.common.entity.BaseEntity;
import com.vc.roservicemanager.tenant.entity.Tenant;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    /**
     * The business this user belongs to. Every user belongs to exactly
     * one tenant - there is no cross-tenant user account today.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(unique = true)
    private String email;

    @Column(name = "contact_number")
    private String contactNumber;

    @Builder.Default
    @Column(nullable = false)
    private boolean enabled = true;
}
