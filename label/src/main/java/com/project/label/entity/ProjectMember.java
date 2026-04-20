package com.project.label.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProjectMember {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    // Thành viên này thuộc dự án nào?
    @ManyToOne
    @JoinColumn(name = "project_id")
    Project project;

    // Thành viên này là ai?
    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;
}