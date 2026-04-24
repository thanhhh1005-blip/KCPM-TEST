package com.project.label.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfig {
    
    @Id
    @Column(name = "config_key", length = 100)
    private String key;   // Ví dụ: "MAX_UPLOAD_SIZE", "ALLOW_REGISTRATION"

    @Column(name = "config_value", columnDefinition = "TEXT")
    private String value; // Ví dụ: "5", "true"

    private String description; // Giải thích ý nghĩa của cấu hình này
}