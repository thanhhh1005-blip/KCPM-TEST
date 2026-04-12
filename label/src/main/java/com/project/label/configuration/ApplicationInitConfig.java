package com.project.label.configuration;

import java.util.HashSet;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.crypto.password.PasswordEncoder;

import com.project.label.entity.User;
import com.project.label.repository.IUserRepository;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ApplicationInitConfig {
  PasswordEncoder passwordEncoder;
  @Bean
  ApplicationRunner applicationRunner(IUserRepository userRepository) {
    return args -> {
      if(userRepository.findByUsername("admin").isEmpty()){
        var roles = new HashSet<String>();
        roles.add("ADMIN");
        User user = User.builder()
            .username("admin")
            .password(passwordEncoder.encode("admin"))
            //.roles(roles)
            .build();
        userRepository.save(user);
        log.warn("Admin user created with username: admin and password: admin, please change the password after first login");
      }
    };
  }
}
