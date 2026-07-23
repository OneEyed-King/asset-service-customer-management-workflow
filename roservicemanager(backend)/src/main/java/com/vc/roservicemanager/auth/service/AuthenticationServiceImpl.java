package com.vc.roservicemanager.auth.service;

import com.vc.roservicemanager.auth.dto.LoginRequest;
import com.vc.roservicemanager.auth.dto.LoginResponse;
import com.vc.roservicemanager.auth.entity.User;
import com.vc.roservicemanager.auth.security.AuthenticatedUser;
import com.vc.roservicemanager.auth.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl
        implements AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    public LoginResponse login(LoginRequest request) {

        authenticationManager.authenticate(

                new UsernamePasswordAuthenticationToken(

                        request.username(),
                        request.password()

                )

        );

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(request.username());

        String token =
                jwtService.generateToken(userDetails);

        AuthenticatedUser authenticatedUser =
                (AuthenticatedUser) userDetails;

        User user =
                authenticatedUser.getUser();

        return new LoginResponse(
                token,
                "Bearer",
                user.getUsername(),
                user.getRole()

        );

    }

}
