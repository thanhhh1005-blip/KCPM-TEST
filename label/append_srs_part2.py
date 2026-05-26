import os

file_path = r'd:\9.GIAO TRINH MON HOC\NAM_3_KI_2_DOT_1\JAVA\label\IEEE_29148_SRS.md'

content = """
## 3.4 Data Requirements & Data Dictionary

This section describes the logical data entities and their attributes required to support the system functionalities. 

### 3.4.1 Data Entities (Data Dictionary)

**Table 1: User**
Stores system user information.
| Attribute | Data Type | Description | Key |
|-----------|-----------|-------------|-----|
| id | UUID (String) | Unique identifier for the user | PK |
| username | String | Unique login name | Unique |
| password | String | Hashed password | - |
| firstName | String | User's first name | - |
| lastName | String | User's last name | - |
| email | String | User's email address | Unique |
| dateOfBirth | Date | User's date of birth | - |

**Table 2: Role**
Stores RBAC roles.
| Attribute | Data Type | Description | Key |
|-----------|-----------|-------------|-----|
| name | String | Role name (e.g., ADMIN) | PK |
| description | String | Detailed description | - |

**Table 3: Permission**
Stores granular permissions.
| Attribute | Data Type | Description | Key |
|-----------|-----------|-------------|-----|
| name | String | Permission name (e.g., MANAGE_USER) | PK |
| description | String | Detailed description | - |

**Table 4: Project**
Stores information about annotation projects.
| Attribute | Data Type | Description | Key |
|-----------|-----------|-------------|-----|
| id | UUID | Unique project identifier | PK |
| name | String | Name of the project | - |
| description | Text | Instructions or details | - |
| status | Enum | ProjectStatus (DRAFT, etc.) | - |
| manager_id | UUID | User ID of project manager | FK |
| reviewer_id | UUID | User ID of default reviewer | FK |
| createdAt | DateTime | Creation timestamp | - |
| updatedAt | DateTime | Last updated timestamp | - |

**Table 5: DataItem**
Stores images uploaded for annotation.
| Attribute | Data Type | Description | Key |
|-----------|-----------|-------------|-----|
| id | UUID | Unique item identifier | PK |
| fileName | String | Original file name | - |
| fileUrl | Text | Cloudinary URL | - |
| rejectReason | String | Reason for rejection | - |
| status | Enum | DataItemStatus | - |
| project_id | UUID | Belongs to project | FK |

**Table 6: Annotation**
Stores bounding box labels per DataItem.
| Attribute | Data Type | Description | Key |
|-----------|-----------|-------------|-----|
| id | UUID | Unique annotation identifier | PK |
| label_id | UUID | Linked Label | FK |
| xCenter | Double | YOLO X coordinate | - |
| yCenter | Double | YOLO Y coordinate | - |
| width | Double | YOLO Width | - |
| height | Double | YOLO Height | - |
| data_item_id | UUID | Linked DataItem | FK |
| user_id | UUID | Annotator who drew this | FK |

**Table 7: Label**
Stores valid labels for a project.
| Attribute | Data Type | Description | Key |
|-----------|-----------|-------------|-----|
| id | UUID | Unique label identifier | PK |
| name | String | Label text (e.g., "Car") | - |
| color | String | Hex color (e.g., "#FF0000") | - |
| project_id | UUID | Belongs to project | FK |

**Table 8: ReviewLog**
Stores history of reviewer actions.
| Attribute | Data Type | Description | Key |
|-----------|-----------|-------------|-----|
| id | UUID | Unique log identifier | PK |
| data_item_id | UUID | Linked DataItem | FK |
| reviewer_id | UUID | Linked User | FK |
| comment | Text | Reason for action | - |
| createdAt | DateTime | Timestamp of review | - |

**Table 9: AuditLog**
Stores all sensitive system actions.
| Attribute | Data Type | Description | Key |
|-----------|-----------|-------------|-----|
| id | UUID | Log identifier | PK |
| username | String | Who performed action | - |
| action | String | CRUD action | - |
| targetEntity | String | Affected entity | - |
| details | String | Extra context | - |
| ipAddress | String | Source IP | - |
| status | String | SUCCESS/FAIL | - |
| timestamp | DateTime | When action occurred | - |

**Table 10: SystemConfig**
Dynamic system settings.
| Attribute | Data Type | Description | Key |
|-----------|-----------|-------------|-----|
| config_key | String | Setting Key (e.g., MAINT) | PK |
| config_value | Text | Value | - |
| description | String | Contextual help | - |

**Table 11: InvalidatedToken**
Blacklisted JWT tokens from logout.
| Attribute | Data Type | Description | Key |
|-----------|-----------|-------------|-----|
| id | String | JWT JTI | PK |
| expiryTime | Date | Expiration of token | - |

## 3.5 External Interface Requirements

### 3.5.1 User Interfaces
The system provides a web-based User Interface (SPA) built with React/Next.js. It features dashboards for Project Managers, a bounding box Canvas for Annotators, and an approval table for Reviewers.

### 3.5.2 Hardware Interfaces
No specific hardware interfaces beyond a standard computer monitor for the user interface, with mouse support for drawing accurate annotations.

### 3.5.3 Software Interfaces
- **Database System:** MySQL 8.0 running on default port 3306.
- **Cloud Storage:** Cloudinary API for image uploads and CDN delivery.
- **Authentication:** Google OAuth2 API endpoints.

### 3.5.4 Communication Interfaces
- **Protocol:** HTTP/HTTPS over TCP/IP.
- **Data Format:** JSON for all Request/Response bodies in the REST API.
"""

with open(file_path, "a", encoding="utf-8") as f:
    f.write(content)
