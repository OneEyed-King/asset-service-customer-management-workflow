//package com.vc.roservicemanager.customer.mapper;
//
//import com.vc.roservicemanager.customer.dto.CustomerDto;
//import com.vc.roservicemanager.customer.dto.CustomerRequest;
//import com.vc.roservicemanager.customer.dto.CustomerSearchDto;
//import com.vc.roservicemanager.customer.entity.Customer;
//
//public final class CustomerMapper {
//
//    private CustomerMapper() {
//    }
//
//    public static CustomerDto toDto(Customer customer) {
//
//        return new CustomerDto(
//                customer.getId(),
//                customer.getName(),
//                customer.getContactNumber(),
//                customer.getAlternateContactNumber(),
//                customer.getEmail(),
//                customer.getAddress(),
//                customer.getNotes()
//        );
//
//    }
//
//    public static CustomerSearchDto toSearchDto(Customer customer) {
//
//        return new CustomerSearchDto(
//                customer.getId(),
//                customer.getName(),
//                customer.getContactNumber()
//        );
//
//    }
//
//    public static Customer toEntity(CustomerRequest request) {
//
//        return Customer.builder()
//                .name(request.name())
//                .contactNumber(request.contactNumber())
//                .alternateContactNumber(request.alternateContactNumber())
//                .email(request.email())
//                .address(request.address())
//                .notes(request.notes())
//                .build();
//
//    }
//
//}