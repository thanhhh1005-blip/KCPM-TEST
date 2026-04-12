package com.project.label.exception;



import java.util.Map;
import java.util.Objects;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.security.access.AccessDeniedException;

import com.project.label.dto.response.ApiResponse;

import jakarta.validation.ConstraintViolation;
import lombok.extern.slf4j.Slf4j;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {


  private static final String MIN_ATTRIBUE = "min";
  // Handle uncategorized exceptions
  @ExceptionHandler(value = Exception.class)
  ResponseEntity<ApiResponse<?>> handlingRuntimeException(Exception e){
    log.error("An unexpected error occurred: ", e);
    ApiResponse<?> response = new ApiResponse<>();
    response.setCode(ErrorCode.UNCATEGORIED_ERROR.getCode());
    response.setMessage(ErrorCode.UNCATEGORIED_ERROR.getMessage());
    return ResponseEntity.badRequest().body(response);
  }
  // Handle validation exceptions
  @ExceptionHandler(value = MethodArgumentNotValidException.class)
  ResponseEntity<ApiResponse<?>> handlingValidationException(MethodArgumentNotValidException e){
    String enumKey = e.getFieldError().getDefaultMessage();
    ErrorCode errorCode = ErrorCode.KEY_INVALID; // Default error code
    Map<String, Object> attributes = null;
    try{
      errorCode = ErrorCode.valueOf(enumKey);

      var constraintViolation = e.getBindingResult().getAllErrors().getFirst().unwrap(ConstraintViolation.class);
      attributes = constraintViolation.getConstraintDescriptor().getAttributes();

      log.info(attributes.toString());

    }catch(IllegalArgumentException ex){
      // If the enum key is not found, use the default error code
    }
    
    ApiResponse<?> response = new ApiResponse<>();
    response.setCode(errorCode.getCode());
    response.setMessage(Objects.nonNull(attributes)
                        ? mapAttribute(errorCode.getMessage(), attributes)
                        : errorCode.getMessage());
    return ResponseEntity.badRequest().body(response);
  }


  private String mapAttribute(String message, Map<String, Object> attributes){
    String minValue =String.valueOf(attributes.get(MIN_ATTRIBUE));
    return message.replace ("{" + MIN_ATTRIBUE + "}", minValue);
  }
  // Handle custom application exceptions
  @ExceptionHandler(value = AppException.class)
  ResponseEntity<ApiResponse<?>> handlingAppException(AppException e){
    ErrorCode errorCode = e.getErrorCode();
    ApiResponse<?> response = new ApiResponse<>();
    response.setCode(errorCode.getCode());
    response.setMessage(errorCode.getMessage());
    return ResponseEntity.status(errorCode.getStatusCode()).body(response);
  }

  //Handle access denied exceptions
  @ExceptionHandler(value = AccessDeniedException.class)
  ResponseEntity<ApiResponse<?>> handlingAccessDeniedException(AccessDeniedException e){
    ErrorCode errorCode = ErrorCode.UNAUTHORIZED;
    return ResponseEntity.status(errorCode.getStatusCode()).body(
                    ApiResponse.builder()
                    .code(errorCode.getCode())
                    .message(errorCode.getMessage())
                    .build()
    );
  }
}
