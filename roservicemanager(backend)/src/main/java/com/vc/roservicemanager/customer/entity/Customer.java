package com.vc.roservicemanager.customer.entity;

import com.vc.roservicemanager.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer extends BaseEntity {

    @Column(nullable = false,length = 100)
    private String name;

    @Column(nullable = false,length = 20)
    private String contactNumber;

    @Column(length = 20)
    private String alternateContactNumber;

    @Column(length = 150)
    private String email;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

}
