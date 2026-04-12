package com.project.label.dto.request;

import java.time.LocalDate;
import java.util.Set;

import com.project.label.entity.Role;
import com.project.label.validator.DobConstraint;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class UserCreationRequest {
  @Size(min = 3, message = "USERNAME_INVALID")
  private String username;
  @Size(min = 8, message = "PASSWORD_INVALID")
  private String password;
  private String firstName;
  private String lastName;
  private String email;
  @DobConstraint(min = 18, message = "INVALID_DOB")
  private LocalDate dateOfBirth;
  private Set<Role> roles;
}
