package com.project.label.validator;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Objects;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class DobValidator implements ConstraintValidator<DobConstraint, LocalDate> {
  private int minAge;

  @Override
  public void initialize(DobConstraint constraintAnnotation) {
    ConstraintValidator.super.initialize(constraintAnnotation);
    this.minAge = constraintAnnotation.min();
  }

  @Override
  public boolean isValid(LocalDate dob, ConstraintValidatorContext context) {
    if(Objects.isNull(dob)) return true; // Let @NotNull handle null case
    long age = ChronoUnit.YEARS.between(dob, LocalDate.now());

    return age >= minAge;
  }

}
