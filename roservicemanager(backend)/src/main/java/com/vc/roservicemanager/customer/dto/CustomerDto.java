package com.vc.roservicemanager.customer.dto;

import java.util.UUID;

public record CustomerDto(

        UUID id,

        String name,

        String contactNumber,

        String alternateContactNumber,

        String email,

        String address,

        String notes

) {
}