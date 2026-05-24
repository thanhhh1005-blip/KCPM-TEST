package com.project.label.configuration;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.crypto.password.PasswordEncoder;

import com.project.label.entity.Permission;
import com.project.label.entity.Role;
import com.project.label.entity.SystemConfig;
import com.project.label.entity.User;
import com.project.label.repository.IPermissionRepository;
import com.project.label.repository.IRoleRepository;
import com.project.label.repository.ISystemConfigRepository;
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
  ApplicationRunner applicationRunner(
      IUserRepository userRepository,
      IRoleRepository roleRepository,
      IPermissionRepository permissionRepository,
      ISystemConfigRepository systemConfigRepository) {
    return args -> {
      // ========== 1. Seed Permissions ==========
      List<String[]> permissionData = List.of(
          new String[]{"CREATE_DATA", "Tạo dữ liệu mới"},
          new String[]{"UPDATE_DATA", "Cập nhật dữ liệu"},
          new String[]{"DELETE_DATA", "Xóa dữ liệu"},
          new String[]{"APPROVE_DATA", "Duyệt dữ liệu đã gán nhãn"},
          new String[]{"REJECT_DATA", "Từ chối dữ liệu đã gán nhãn"},
          new String[]{"MANAGE_PROJECT", "Quản lý dự án"},
          new String[]{"MANAGE_USER", "Quản lý người dùng"},
          new String[]{"VIEW_REPORT", "Xem báo cáo thống kê"},
          new String[]{"EXPORT_DATA", "Xuất dữ liệu"},
          new String[]{"ANNOTATE_DATA", "Gán nhãn dữ liệu"},
          new String[]{"REVIEW_DATA", "Review dữ liệu đã gán nhãn"}
      );

      for (String[] pd : permissionData) {
        if (permissionRepository.findById(pd[0]).isEmpty()) {
          permissionRepository.save(Permission.builder()
              .name(pd[0])
              .description(pd[1])
              .build());
          log.info("Created permission: {}", pd[0]);
        }
      }

      // ========== 2. Seed Roles ==========
      // ADMIN - full quyền
      createRoleIfNotExists(roleRepository, permissionRepository,
          "ADMIN", "Quản trị viên hệ thống",
          List.of("CREATE_DATA", "UPDATE_DATA", "DELETE_DATA", "APPROVE_DATA",
              "REJECT_DATA", "MANAGE_PROJECT", "MANAGE_USER", "VIEW_REPORT",
              "EXPORT_DATA", "ANNOTATE_DATA", "REVIEW_DATA"));

      // MANAGER
      createRoleIfNotExists(roleRepository, permissionRepository,
          "MANAGER", "Quản lý dự án",
          List.of("CREATE_DATA", "UPDATE_DATA", "DELETE_DATA",
              "MANAGE_PROJECT", "VIEW_REPORT", "EXPORT_DATA"));

      // ANNOTATOR
      createRoleIfNotExists(roleRepository, permissionRepository,
          "ANNOTATOR", "Người gán nhãn",
          List.of("ANNOTATE_DATA", "VIEW_REPORT"));

      // REVIEWER
      createRoleIfNotExists(roleRepository, permissionRepository,
          "REVIEWER", "Người duyệt nhãn",
          List.of("REVIEW_DATA", "APPROVE_DATA", "REJECT_DATA", "VIEW_REPORT"));

      // ========== 3. Seed Admin User ==========
      if (userRepository.findByUsername("admin").isEmpty()) {
        Role adminRole = roleRepository.findById("ADMIN").orElseThrow();
        Set<Role> roles = new HashSet<>();
        roles.add(adminRole);

        User user = User.builder()
            .username("admin")
            .password(passwordEncoder.encode("admin"))
            .roles(roles)
            .build();
        userRepository.save(user);
        log.warn("Admin user created with username: admin and password: admin, please change the password after first login");
      }

      // ========== 4. Seed SystemConfig ==========
      createConfigIfNotExists(systemConfigRepository,
          "SYSTEM_MAINTENANCE", "false", "Bật/tắt chế độ bảo trì hệ thống (true/false)");
      createConfigIfNotExists(systemConfigRepository,
          "ALLOW_USER_REGISTRATION", "true", "Cho phép người dùng tự đăng ký (true/false)");

      log.info("Application initialization completed successfully!");
    };
  }

  private void createRoleIfNotExists(IRoleRepository roleRepository,
      IPermissionRepository permissionRepository,
      String name, String description, List<String> permissionNames) {
    if (roleRepository.findById(name).isEmpty()) {
      var permissions = new HashSet<>(permissionRepository.findAllById(permissionNames));
      roleRepository.save(Role.builder()
          .name(name)
          .description(description)
          .permissions(permissions)
          .build());
      log.info("Created role: {} with {} permissions", name, permissions.size());
    }
  }

  private void createConfigIfNotExists(ISystemConfigRepository repo,
      String key, String value, String description) {
    if (repo.findById(key).isEmpty()) {
      repo.save(SystemConfig.builder()
          .key(key)
          .value(value)
          .description(description)
          .build());
      log.info("Created system config: {} = {}", key, value);
    }
  }
}
