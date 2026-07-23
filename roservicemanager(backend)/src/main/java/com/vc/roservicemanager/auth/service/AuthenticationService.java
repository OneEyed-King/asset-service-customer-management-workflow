package com.vc.roservicemanager.auth.service;

import com.vc.roservicemanager.auth.dto.LoginRequest;
import com.vc.roservicemanager.auth.dto.LoginResponse;

public interface AuthenticationService {

    LoginResponse login(LoginRequest request);

}
