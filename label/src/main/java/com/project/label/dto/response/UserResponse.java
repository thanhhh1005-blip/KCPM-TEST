package com.project.label.dto.response;

import java.time.LocalDate;
import java.util.Set;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class UserResponse {
  String id;
  String username;
  String firstName;
  String lastName;
  String email;
  LocalDate dateOfBirth;
  Set<RoleResponse> roles;
}
