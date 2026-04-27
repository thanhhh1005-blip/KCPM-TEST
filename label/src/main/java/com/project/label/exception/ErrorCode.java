package com.project.label.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public enum ErrorCode {
  USER_EXISTS(1001, "User already exists", HttpStatus.BAD_REQUEST),
  USER_NOT_EXISTS(1002, "User not exists",HttpStatus.NOT_FOUND), 
  UNCATEGORIED_ERROR(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
  KEY_INVALID(0001,"Key is invalid", HttpStatus.BAD_REQUEST),
  USERNAME_INVALID(1003,"Username must be between {min} characters", HttpStatus.BAD_REQUEST),
  PASSWORD_INVALID(1004,"Password must be between {min} characters", HttpStatus.BAD_REQUEST),
  UNAUTHENTICATED(1005,"Unauthenticated", HttpStatus.UNAUTHORIZED),
  UNAUTHORIZED(1007,"you don't have permission to access this resource", HttpStatus.FORBIDDEN),
  UNDER_MAINTENANCE(1008, "The system is undergoing maintenance, please check back later.", HttpStatus.FORBIDDEN),
  OVERLOAD_FILE(1009, "heavy file, over loading", HttpStatus.BAD_REQUEST),
  INVALID_DOB(1006,"Your age must be at least {min}", HttpStatus.BAD_REQUEST),
  ;


  private final int code;
  private final String message;
  private final HttpStatus statusCode;
  ErrorCode(int code, String message, HttpStatus statusCode) {
    this.code = code;
    this.message = message;
    this.statusCode = statusCode;
  }
}
