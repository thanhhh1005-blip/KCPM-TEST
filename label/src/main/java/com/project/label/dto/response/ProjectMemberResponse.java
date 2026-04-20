package com.project.label.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProjectMemberResponse {
    private String userId;
    private String fullName;
    private String username;
    private String roleName;
}