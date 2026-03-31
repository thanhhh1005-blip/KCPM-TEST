package com.project.label.dto.request;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class UserCreationRequest {
  private String username;
  private String password;
  private String firstName;
  private String lastName;
  private String email;
  private LocalDate dateOfBirth;
}
