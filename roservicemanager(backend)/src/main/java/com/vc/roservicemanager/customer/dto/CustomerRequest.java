package com.vc.roservicemanager.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CustomerRequest(

        @NotBlank
        String name,

        @NotBlank
        String contactNumber,

        String alternateContactNumber,

        @Email
        String email,

        String address,

        String notes

) {
}
