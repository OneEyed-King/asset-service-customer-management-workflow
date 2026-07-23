package com.vc.roservicemanager.customer.dto;

import java.util.UUID;

public record CustomerSearchDto(

        UUID id,

        String name,

        String contactNumber

) {
}
