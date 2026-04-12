package com.project.label.service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.Payload;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.project.label.dto.request.AuthenticationRequest;
import com.project.label.dto.request.IntrospectRequest;
import com.project.label.dto.request.LogoutRequest;
import com.project.label.dto.request.RefreshRequest;
import com.project.label.dto.response.AuthenticationResponse;
import com.project.label.dto.response.IntrospectResponse;
import com.project.label.entity.InvalidatedToken;
import com.project.label.entity.User;
import com.project.label.exception.AppException;
import com.project.label.exception.ErrorCode;
import com.project.label.repository.IInvalidatedTokenRepository;
import com.project.label.repository.IUserRepository;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {
  IUserRepository userRepository;
  IInvalidatedTokenRepository invalidatedTokenRepository;

  @NonFinal
  @Value("${jwt.signerKey}")
  protected String SIGNER_KEY;

  @NonFinal
  @Value("${jwt.valid-duration}")
  protected long VALID_DURATION;

  @NonFinal
  @Value("${jwt.refreshable-duration}")
  protected long REFRESHABLE_DURATION;

  public AuthenticationResponse authenticate(AuthenticationRequest request){
    PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
    var user = userRepository.findByUsername(request.getUsername())
                            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
    boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());
    if(!authenticated){
      throw new AppException(ErrorCode.UNAUTHENTICATED);
    }
    var token = generateToken(user);
      return AuthenticationResponse.builder()
              .token(token)
              .authenticated(true)
              .build();
  }


  private String generateToken(User user){
    JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
    JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("label.com")
                .issueTime(new Date())
                .expirationTime(new Date(
                    Instant.now().plus(VALID_DURATION, ChronoUnit.HOURS).toEpochMilli()
                ))  
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildScope(user))
                .build();
    Payload payload = new Payload(jwtClaimsSet.toJSONObject());
    JWSObject jwsObject = new JWSObject(header, payload);
    try{
      jwsObject.sign(new MACSigner(SIGNER_KEY));
      return jwsObject.serialize();
    }catch(JOSEException e){
      log.error("Cannot create token", e);
      throw new RuntimeException(e);
    }
  }
  public IntrospectResponse introspect(IntrospectRequest request) 
    throws java.text.ParseException, JOSEException{
      
    var token = request.getToken();
    boolean isValid = true;
    try{verifyToken(token, false);}
    catch(AppException e){
      isValid = false;
    }

    return IntrospectResponse.builder()
                    .valid(isValid)
                    .build();
  }

  public String buildScope(User user){
    StringJoiner stringJoiner = new StringJoiner(" ");

    if(!CollectionUtils.isEmpty(user.getRoles())){
      user.getRoles().forEach(role -> {
        stringJoiner.add("ROLE_" + role.getName());

        if(!CollectionUtils.isEmpty(role.getPermissions())){
          role.getPermissions()
              .forEach(permission -> {stringJoiner.add(permission.getName());
          });
        }
      });
    }
    return stringJoiner.toString();
  }

  public void logout(LogoutRequest request) throws ParseException, JOSEException{
    try{var signToken = verifyToken(request.getToken(), true);
      String jit = signToken.getJWTClaimsSet().getJWTID();
      Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();
      InvalidatedToken invalidatedToken = InvalidatedToken.builder()
            .id(jit)
            .expiryTime(expiryTime)
            .build();
      invalidatedTokenRepository.save(invalidatedToken);
    }
    catch(AppException e){
      log.warn("Invalid token provided for logout");
    }

    
  }
  
  private SignedJWT verifyToken(String token, boolean isRefresh) throws ParseException, JOSEException {
    JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
    SignedJWT signedJWT = SignedJWT.parse(token);
    Date expiryDate =(isRefresh) 
        ? new Date(signedJWT.getJWTClaimsSet().getIssueTime().toInstant().plus(REFRESHABLE_DURATION, ChronoUnit.HOURS).toEpochMilli())
        : signedJWT.getJWTClaimsSet().getExpirationTime();
    var verified = signedJWT.verify(verifier);
    if(!(verified && expiryDate.after(new Date()))) throw new AppException(ErrorCode.UNAUTHENTICATED);
    if(invalidatedTokenRepository
        .existsById(signedJWT.getJWTClaimsSet().getJWTID()))
      throw new AppException(ErrorCode.UNAUTHENTICATED);
    return signedJWT;
  }

  public AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException{
    var signedJWT = verifyToken(request.getToken(), true);
    var jit = signedJWT.getJWTClaimsSet().getJWTID();
    var expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

    InvalidatedToken invalidatedToken = InvalidatedToken.builder()
            .id(jit)
            .expiryTime(expiryTime)
            .build();
    invalidatedTokenRepository.save(invalidatedToken);

    var username = signedJWT.getJWTClaimsSet().getSubject();
    var user = userRepository.findByUsername(username)
                            .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

    var token = generateToken(user);
      return AuthenticationResponse.builder()
              .token(token)
              .authenticated(true)
              .build();
  }
}
