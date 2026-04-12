package com.project.label.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nimbusds.jose.JOSEException;
import com.project.label.dto.request.AuthenticationRequest;
import com.project.label.dto.request.IntrospectRequest;
import com.project.label.dto.request.LogoutRequest;
import com.project.label.dto.request.RefreshRequest;
import com.project.label.dto.response.ApiResponse;
import com.project.label.dto.response.AuthenticationResponse;
import com.project.label.dto.response.IntrospectResponse;
import com.project.label.service.AuthenticationService;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import java.text.ParseException;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

  AuthenticationService authenticationService;

  @PostMapping("/token")
  public ApiResponse<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request){
    var result =authenticationService.authenticate(request);
    return ApiResponse.<AuthenticationResponse>builder()
                      .result(result)
                      .build();  
  }
  
  @PostMapping("/introspect")
  public ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request)
    throws ParseException, JOSEException{
    var result =authenticationService.introspect(request);
    return ApiResponse.<IntrospectResponse>builder()
                      .result(result)
                      .build();  
  }

  @PostMapping("/logout")
  public ApiResponse<Void> logout(@RequestBody LogoutRequest request)
    throws ParseException, JOSEException{
    authenticationService.logout(request);
    return ApiResponse.<Void>builder()
                      .build();  
  }


  @PostMapping("/refresh")
  public ApiResponse<AuthenticationResponse> refreshToken(@RequestBody RefreshRequest request) throws ParseException, JOSEException{
    var result =authenticationService.refreshToken(request);
    log.info("Refreshed token: {}", result.getToken());
    return ApiResponse.<AuthenticationResponse>builder()
                      .result(result)
                      .build();  
  }
}
