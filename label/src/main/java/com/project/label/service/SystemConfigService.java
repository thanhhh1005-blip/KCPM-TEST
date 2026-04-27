package com.project.label.service;

import com.project.label.entity.SystemConfig;
import com.project.label.repository.ISystemConfigRepository;

public class SystemConfigService {

  ISystemConfigRepository systemConfigRepository;

  public String getConfig(String key, String defaultValue) {
    return systemConfigRepository.findById(key)
        .map(SystemConfig::getValue)
        .orElse(defaultValue);
  }
}
