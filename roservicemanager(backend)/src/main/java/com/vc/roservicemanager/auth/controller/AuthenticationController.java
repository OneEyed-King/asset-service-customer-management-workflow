package com.vc.roservicemanager.auth.controller;

import com.vc.roservicemanager.auth.dto.LoginRequest;
import com.vc.roservicemanager.auth.dto.LoginResponse;
import com.vc.roservicemanager.auth.dto.UserDetailsResponse;
import com.vc.roservicemanager.auth.entity.User;
import com.vc.roservicemanager.auth.security.AuthenticatedUser;
import com.vc.roservicemanager.auth.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

//dsfsdf
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public LoginResponse login(
            @Valid
            @RequestBody
            LoginRequest request) {

        return authenticationService.login(request);

    }

    @GetMapping("/me")
    public UserDetailsResponse me(
            @AuthenticationPrincipal AuthenticatedUser user) {

        User u = user.getUser();

        return new UserDetailsResponse(

                u.getUsername(),

                u.getFullName(),

                u.getEmail(),

                u.getContactNumber(),

                u.getRole()

        );

    }

}