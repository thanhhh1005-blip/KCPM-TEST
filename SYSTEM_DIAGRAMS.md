# 🏷️ Label Management System - Diagrams

## System Overview

Hệ thống quản lý gán nhãn dữ liệu (Data Labeling System) với các vai trò:

- **Manager**: Quản lý dự án, bộ dữ liệu, phân công công việc, theo dõi tiến độ
- **Admin**: Quản lý người dùng, cấu hình hệ thống, quản lý nhật ký hoạt động
- **Annotator**: Gán nhãn cho dữ liệu
- **Reviewer**: Duyệt chất lượng nhãn

---

# 👨‍💼 MANAGER DIAGRAMS

## 1️⃣ Manager - Use Case Diagram

```mermaid
graph TB
    subgraph ManagerSystem["👨‍💼 Manager System"]
        UC1["Manage Labeling Projects"]
        UC2["Manage Datasets"]
        UC3["Setup Labels & Guidelines"]
        UC4["Assign Tasks to Annotators"]
        UC5["Track Labeling Status"]
        UC6["Monitor Labeling Quality"]
        UC7["Export Approved Data"]
        UC8["AI-Assisted Labeling"]
    end

    Manager["👨‍💼 Manager"]
    
    Manager -->|can perform| UC1
    Manager -->|can perform| UC2
    Manager -->|can perform| UC3
    Manager -->|can perform| UC4
    Manager -->|can perform| UC5
    Manager -->|can perform| UC6
    Manager -->|can perform| UC7
    Manager -->|can perform| UC8

    style ManagerSystem fill:#fff3e0
    style Manager fill:#ffe0b2
```

### Manager Chức năng (7 use cases):
1. **Manage Labeling Projects** - Tạo, cập nhật, xóa dự án gán nhãn
2. **Manage Datasets** - Nhập, cập nhật, xóa bộ dữ liệu
3. **Setup Labels & Guidelines** - Định nghĩa nhãn, hướng dẫn gán nhãn
4. **Assign Tasks to Annotators** - Phân công công việc cho annotators
5. **Track Labeling Status** - Theo dõi tiến độ gán nhãn
6. **Monitor Labeling Quality** - Kiểm tra chất lượng nhãn
7. **Export Approved Data** - Xuất dữ liệu đã duyệt
8. **AI-Assisted Labeling** - Hỗ trợ gán nhãn bằng AI (tùy chọn)

---

## 2️⃣ Manager - Class Diagram

```mermaid
classDiagram
    class User {
        -Long userId
        -String username
        -String email
        -String password
        -String fullName
        -UserRole role
        -LocalDateTime createdAt
        +getRole()
        +updateProfile()
    }

    class Project {
        -Long projectId
        -String projectName
        -String description
        -LocalDateTime startDate
        -LocalDateTime endDate
        -ProjectStatus status
        -User manager
        +createProject()
        +updateStatus()
        +deleteProject()
    }

    class ProjectStatus {
        <<enumeration>>
        PLANNING
        IN_PROGRESS
        COMPLETED
        ARCHIVED
    }

    class Dataset {
        -Long datasetId
        -String datasetName
        -String filePath
        -Integer totalRecords
        -DatasetStatus status
        +importData()
        +getRecordCount()
        +deleteDataset()
    }

    class DatasetStatus {
        <<enumeration>>
        UPLOADED
        PROCESSING
        READY
        COMPLETED
    }

    class Label {
        -Long labelId
        -String labelName
        -String labelValue
        -String color
        -String guidelines
        +createLabel()
        +updateLabel()
        +deleteLabel()
    }

    class LabelingTask {
        -Long taskId
        -User annotator
        -User reviewer
        -TaskStatus status
        -LocalDateTime dueDate
        -Integer recordsToLabel
        -Integer recordsLabeled
        +assignToAnnotator()
        +updateProgress()
        +reviewTask()
    }

    class TaskStatus {
        <<enumeration>>
        ASSIGNED
        IN_PROGRESS
        COMPLETED
        REJECTED
        UNDER_REVIEW
    }

    class QualityMetric {
        -Long metricId
        -Float accuracy
        -Float consistency
        -Float completionRate
        -LocalDateTime recordedAt
        +calculateMetrics()
        +getQualityReport()
    }

    class DataExport {
        -Long exportId
        -ExportFormat format
        -String filePath
        -ExportStatus status
        -LocalDateTime exportedAt
        +exportData()
        +downloadFile()
    }

    class ExportFormat {
        <<enumeration>>
        CSV
        JSON
        XML
        PARQUET
    }

    User "1" --> "*" Project : manages
    User "1" --> "*" LabelingTask : assigns
    Project "1" --> "*" Dataset : contains
    Project "1" --> "*" Label : defines
    Project "1" --> "1" QualityMetric : has
    Project "1" --> "*" DataExport : exports
    Dataset "1" --> "*" LabelingTask : has
    Label "1" --> "*" LabelingTask : labels
    User --> ProjectStatus
    Dataset --> DatasetStatus
    LabelingTask --> TaskStatus
    DataExport --> ExportFormat

    style User fill:#fff3e0
    style Project fill:#e1f5ff
    style Dataset fill:#e1f5ff
    style Label fill:#e1f5ff
    style LabelingTask fill:#f3e5f5
    style QualityMetric fill:#c8e6c9
    style DataExport fill:#b3e5fc
```

### Manager Class Model:
- **User**: Manager (vai trò MANAGER)
- **Project**: Dự án được tạo & quản lý bởi Manager
- **Dataset**: Bộ dữ liệu trong project
- **Label**: Danh sách nhãn
- **LabelingTask**: Công việc được phân công
- **QualityMetric**: Chỉ số chất lượng
- **DataExport**: Xuất dữ liệu

---

## 3️⃣ Manager - Sequence Diagram

```mermaid
sequenceDiagram
    participant Manager
    participant ProjectService
    participant DatasetService
    participant TaskService
    participant Database

    rect rgb(200, 220, 240)
    note right of Manager: 1. Tạo dự án
    Manager->>ProjectService: createProject(name, description)
    ProjectService->>Database: save(Project)
    Database-->>ProjectService: projectId
    ProjectService-->>Manager: projectCreated
    end

    rect rgb(200, 220, 240)
    note right of Manager: 2. Nhập bộ dữ liệu
    Manager->>DatasetService: uploadDataset(file, projectId)
    DatasetService->>Database: importRecords(dataset)
    Database-->>DatasetService: datasetStatus
    DatasetService-->>Manager: datasetUploaded
    end

    rect rgb(200, 220, 240)
    note right of Manager: 3. Thiết lập nhãn & hướng dẫn
    Manager->>ProjectService: setupLabels(labels, guidelines)
    ProjectService->>Database: saveLabels(labels)
    Database-->>ProjectService: success
    ProjectService-->>Manager: labelsConfigured
    end

    rect rgb(200, 220, 240)
    note right of Manager: 4. Phân công công việc
    Manager->>TaskService: assignTasks(annotators, datasetId)
    TaskService->>Database: createTasks(tasks)
    Database-->>TaskService: taskIds
    TaskService-->>Manager: tasksAssigned
    end

    rect rgb(200, 220, 240)
    note right of Manager: 5. Theo dõi tiến độ
    Manager->>TaskService: getTaskStatus(projectId)
    TaskService->>Database: queryTasks(projectId)
    Database-->>TaskService: taskList
    TaskService-->>Manager: progressReport
    end

    rect rgb(200, 220, 240)
    note right of Manager: 6. Kiểm tra chất lượng
    Manager->>ProjectService: getQualityMetrics(projectId)
    ProjectService->>Database: calculateMetrics()
    Database-->>ProjectService: metrics
    ProjectService-->>Manager: qualityReport
    end

    rect rgb(200, 220, 240)
    note right of Manager: 7. Xuất dữ liệu đã duyệt
    Manager->>DatasetService: exportData(projectId, format)
    DatasetService->>Database: getApprovedRecords()
    Database-->>DatasetService: records
    DatasetService->>DatasetService: convertFormat(format)
    DatasetService-->>Manager: exportedFile
    end
```

### Manager Workflow (7 bước):
1. **Tạo dự án** → ProjectService save
2. **Nhập bộ dữ liệu** → DatasetService import
3. **Thiết lập nhãn** → Setup configuration
4. **Phân công công việc** → Create tasks
5. **Theo dõi tiến độ** → Query status
6. **Kiểm tra chất lượng** → Calculate metrics
7. **Xuất dữ liệu** → Export approved data

---

# 👨‍💻 ADMIN DIAGRAMS

## 4️⃣ Admin - Use Case Diagram

```mermaid
graph TB
    subgraph AdminSystem["👨‍💻 Admin System"]
        UC1["Manage Users"]
        UC2["Create User Accounts"]
        UC3["Update User Roles"]
        UC4["Deactivate User Accounts"]
        UC5["System Configuration"]
        UC6["Configure System Parameters"]
        UC7["Set System Limits"]
        UC8["Manage Activity Logs"]
        UC9["View Audit Logs"]
        UC10["Export Activity Reports"]
    end

    Admin["👨‍💻 Admin"]
    
    Admin -->|can perform| UC1
    Admin -->|can perform| UC2
    Admin -->|can perform| UC3
    Admin -->|can perform| UC4
    Admin -->|can perform| UC5
    Admin -->|can perform| UC6
    Admin -->|can perform| UC7
    Admin -->|can perform| UC8
    Admin -->|can perform| UC9
    Admin -->|can perform| UC10

    style AdminSystem fill:#f3e5f5
    style Admin fill:#e1bee7
```

### Admin Chức năng (10 use cases):
**Quản lý Người dùng (4):**
1. **Manage Users** - Quản lý toàn bộ tài khoản
2. **Create User Accounts** - Tạo tài khoản mới
3. **Update User Roles** - Cập nhật vai trò người dùng
4. **Deactivate User Accounts** - Vô hiệu hóa tài khoản

**Cấu hình Hệ thống (3):**
5. **System Configuration** - Quản lý cấu hình chung
6. **Configure System Parameters** - Thiết lập tham số hệ thống
7. **Set System Limits** - Thiết lập giới hạn (tải, người dùng, v.v.)

**Quản lý Nhật ký (3):**
8. **Manage Activity Logs** - Quản lý nhật ký
9. **View Audit Logs** - Xem lịch sử hoạt động
10. **Export Activity Reports** - Xuất báo cáo

---

## 5️⃣ Admin - Class Diagram

```mermaid
classDiagram
    class User {
        -Long userId
        -String username
        -String email
        -String password
        -String fullName
        -UserRole role
        -UserStatus status
        -LocalDateTime createdAt
        -LocalDateTime updatedAt
        +createUser()
        +updateRole()
        +deactivateUser()
        +activateUser()
    }

    class UserRole {
        <<enumeration>>
        ADMIN
        MANAGER
        ANNOTATOR
        REVIEWER
    }

    class UserStatus {
        <<enumeration>>
        ACTIVE
        INACTIVE
        SUSPENDED
    }

    class SystemConfig {
        -Long configId
        -String configKey
        -String configValue
        -ConfigType configType
        -LocalDateTime updatedAt
        -User updatedBy
        +updateConfig()
        +getConfig()
    }

    class ConfigType {
        <<enumeration>>
        STRING
        NUMBER
        BOOLEAN
        JSON
    }

    class SystemLimit {
        -Long limitId
        -String limitName
        -Integer limitValue
        -LimitCategory category
        -LocalDateTime updatedAt
        +setLimit()
        +getLimit()
    }

    class LimitCategory {
        <<enumeration>>
        MAX_USERS
        MAX_PROJECTS
        MAX_FILE_SIZE
        SESSION_TIMEOUT
        API_RATE_LIMIT
    }

    class AuditLog {
        -Long logId
        -User user
        -String action
        -String entityType
        -Long entityId
        -String oldValue
        -String newValue
        -String ipAddress
        -LocalDateTime timestamp
        +logAction()
        +searchLogs()
    }

    class AuditLogType {
        <<enumeration>>
        CREATE_USER
        UPDATE_USER
        DELETE_USER
        UPDATE_CONFIG
        UPDATE_LIMIT
        LOGIN
        LOGOUT
    }

    User --> UserRole
    User --> UserStatus
    User "1" --> "*" AuditLog : performs
    User "1" --> "*" SystemConfig : updates
    User "1" --> "*" SystemLimit : updates
    SystemConfig --> ConfigType
    SystemLimit --> LimitCategory
    AuditLog --> AuditLogType

    style User fill:#f3e5f5
    style SystemConfig fill:#c8e6c9
    style SystemLimit fill:#c8e6c9
    style AuditLog fill:#ffe0b2
```

### Admin Class Model:
- **User**: Quản lý người dùng (ADMIN, MANAGER, ANNOTATOR, REVIEWER)
- **UserStatus**: ACTIVE, INACTIVE, SUSPENDED
- **SystemConfig**: Cấu hình hệ thống (key-value)
- **SystemLimit**: Giới hạn hệ thống
- **AuditLog**: Nhật ký hoạt động
- **AuditLogType**: Loại action được log

---

## 6️⃣ Admin - Sequence Diagram

```mermaid
sequenceDiagram
    participant Admin
    participant UserService
    participant SystemConfigService
    participant AuditLogService
    participant Database

    rect rgb(240, 220, 200)
    note right of Admin: 1. Tạo tài khoản người dùng
    Admin->>UserService: createUser(username, email, role)
    UserService->>UserService: validateInput()
    UserService->>Database: saveUser(user)
    Database-->>UserService: userId
    UserService->>AuditLogService: logAction("CREATE_USER")
    UserService-->>Admin: userCreated
    end

    rect rgb(240, 220, 200)
    note right of Admin: 2. Cập nhật vai trò người dùng
    Admin->>UserService: updateUserRole(userId, newRole)
    UserService->>Database: updateUser(user)
    Database-->>UserService: success
    UserService->>AuditLogService: logAction("UPDATE_USER_ROLE")
    UserService-->>Admin: roleUpdated
    end

    rect rgb(240, 220, 200)
    note right of Admin: 3. Vô hiệu hóa tài khoản
    Admin->>UserService: deactivateUser(userId)
    UserService->>Database: updateUserStatus("INACTIVE")
    Database-->>UserService: success
    UserService->>AuditLogService: logAction("DEACTIVATE_USER")
    UserService-->>Admin: userDeactivated
    end

    rect rgb(240, 200, 220)
    note right of Admin: 4. Cấu hình tham số hệ thống
    Admin->>SystemConfigService: updateSystemConfig(key, value)
    SystemConfigService->>SystemConfigService: validateConfig()
    SystemConfigService->>Database: saveConfig(settings)
    Database-->>SystemConfigService: success
    SystemConfigService->>AuditLogService: logAction("UPDATE_SYSTEM_CONFIG")
    SystemConfigService-->>Admin: configUpdated
    end

    rect rgb(240, 200, 220)
    note right of Admin: 5. Thiết lập giới hạn hệ thống
    Admin->>SystemConfigService: setSystemLimit(limitName, limitValue)
    SystemConfigService->>Database: saveLimit(limit)
    Database-->>SystemConfigService: success
    SystemConfigService->>AuditLogService: logAction("SET_SYSTEM_LIMIT")
    SystemConfigService-->>Admin: limitSet
    end

    rect rgb(220, 240, 200)
    note right of Admin: 6. Xem nhật ký hoạt động
    Admin->>AuditLogService: getAuditLogs(filters)
    AuditLogService->>Database: queryLogs(filters)
    Database-->>AuditLogService: logList
    AuditLogService-->>Admin: logReport
    end

    rect rgb(220, 240, 200)
    note right of Admin: 7. Xuất báo cáo hoạt động
    Admin->>AuditLogService: exportAuditReport(format)
    AuditLogService->>Database: getAllLogs()
    Database-->>AuditLogService: logs
    AuditLogService->>AuditLogService: convertToFormat(format)
    AuditLogService-->>Admin: reportFile
    end
```

### Admin Workflow (7 bước):
**Quản lý Người dùng (3):**
1. **Tạo tài khoản** → Validate, save, log action
2. **Cập nhật vai trò** → Update role, log change
3. **Vô hiệu hóa tài khoản** → Deactivate, log action

**Cấu hình Hệ thống (2):**
4. **Cấu hình tham số** → Validate, save settings
5. **Thiết lập giới hạn** → Set limits

**Quản lý Nhật ký (2):**
6. **Xem logs** → Query audit logs
7. **Xuất báo cáo** → Export report

---

## Architecture Stack

```mermaid
sequenceDiagram
    participant Manager
    participant ProjectService
    participant DatasetService
    participant TaskService
    participant Database

    rect rgb(200, 220, 240)
    note right of Manager: 1. Tạo dự án
    Manager->>ProjectService: createProject(name, description)
    ProjectService->>Database: save(Project)
    Database-->>ProjectService: projectId
    ProjectService-->>Manager: projectCreated
    end

    rect rgb(200, 220, 240)
    note right of Manager: 2. Nhập bộ dữ liệu
    Manager->>DatasetService: uploadDataset(file, projectId)
    DatasetService->>Database: importRecords(dataset)
    Database-->>DatasetService: datasetStatus
    DatasetService-->>Manager: datasetUploaded
    end

    rect rgb(200, 220, 240)
    note right of Manager: 3. Thiết lập nhãn & hướng dẫn
    Manager->>ProjectService: setupLabels(labels, guidelines)
    ProjectService->>Database: saveLabels(labels)
    Database-->>ProjectService: success
    ProjectService-->>Manager: labelsConfigured
    end

    rect rgb(200, 220, 240)
    note right of Manager: 4. Phân công công việc
    Manager->>TaskService: assignTasks(annotators, datasetId)
    TaskService->>Database: createTasks(tasks)
    Database-->>TaskService: taskIds
    TaskService-->>Manager: tasksAssigned
    end

    rect rgb(200, 220, 240)
    note right of Manager: 5. Theo dõi tiến độ
    Manager->>TaskService: getTaskStatus(projectId)
    TaskService->>Database: queryTasks(projectId)
    Database-->>TaskService: taskList
    TaskService-->>Manager: progressReport
    end

    rect rgb(200, 220, 240)
    note right of Manager: 6. Kiểm tra chất lượng
    Manager->>ProjectService: getQualityMetrics(projectId)
    ProjectService->>Database: calculateMetrics()
    Database-->>ProjectService: metrics
    ProjectService-->>Manager: qualityReport
    end

    rect rgb(200, 220, 240)
    note right of Manager: 7. Xuất dữ liệu đã duyệt
    Manager->>DatasetService: exportData(projectId, format)
    DatasetService->>Database: getApprovedRecords()
    Database-->>DatasetService: records
    DatasetService->>DatasetService: convertFormat(format)
    DatasetService-->>Manager: exportedFile
    end
```

### Manager Workflow (7 bước):
1. **Tạo dự án** → ProjectService save
2. **Nhập bộ dữ liệu** → DatasetService import
3. **Thiết lập nhãn** → Setup configuration
4. **Phân công công việc** → Create tasks
5. **Theo dõi tiến độ** → Query status
6. **Kiểm tra chất lượng** → Calculate metrics
7. **Xuất dữ liệu** → Export approved data

---

# 👨‍💻 ADMIN DIAGRAMS

## 4️⃣ Admin - Use Case Diagram

```mermaid
graph TB
    subgraph AdminSystem["👨‍💻 Admin System"]
        UC1["Manage Users"]
        UC2["Create User Accounts"]
        UC3["Update User Roles"]
        UC4["Deactivate User Accounts"]
        UC5["System Configuration"]
        UC6["Configure System Parameters"]
        UC7["Set System Limits"]
        UC8["Manage Activity Logs"]
        UC9["View Audit Logs"]
        UC10["Export Activity Reports"]
    end

    Admin["👨‍💻 Admin"]
    
    Admin -->|can perform| UC1
    Admin -->|can perform| UC2
    Admin -->|can perform| UC3
    Admin -->|can perform| UC4
    Admin -->|can perform| UC5
    Admin -->|can perform| UC6
    Admin -->|can perform| UC7
    Admin -->|can perform| UC8
    Admin -->|can perform| UC9
    Admin -->|can perform| UC10

    style AdminSystem fill:#f3e5f5
    style Admin fill:#e1bee7
```

### Admin Chức năng (10 use cases):
**Quản lý Người dùng (4):**
1. **Manage Users** - Quản lý toàn bộ tài khoản
2. **Create User Accounts** - Tạo tài khoản mới
3. **Update User Roles** - Cập nhật vai trò người dùng
4. **Deactivate User Accounts** - Vô hiệu hóa tài khoản

**Cấu hình Hệ thống (3):**
5. **System Configuration** - Quản lý cấu hình chung
6. **Configure System Parameters** - Thiết lập tham số hệ thống
7. **Set System Limits** - Thiết lập giới hạn (tải, người dùng, v.v.)

**Quản lý Nhật ký (3):**
8. **Manage Activity Logs** - Quản lý nhật ký
9. **View Audit Logs** - Xem lịch sử hoạt động
10. **Export Activity Reports** - Xuất báo cáo

---

## 5️⃣ Admin - Class Diagram

```mermaid
classDiagram
    class User {
        -Long userId
        -String username
        -String email
        -String password
        -String fullName
        -UserRole role
        -UserStatus status
        -LocalDateTime createdAt
        -LocalDateTime updatedAt
        +createUser()
        +updateRole()
        +deactivateUser()
        +activateUser()
    }

    class UserRole {
        <<enumeration>>
        ADMIN
        MANAGER
        ANNOTATOR
        REVIEWER
    }

    class UserStatus {
        <<enumeration>>
        ACTIVE
        INACTIVE
        SUSPENDED
    }

    class SystemConfig {
        -Long configId
        -String configKey
        -String configValue
        -ConfigType configType
        -LocalDateTime updatedAt
        -User updatedBy
        +updateConfig()
        +getConfig()
    }

    class ConfigType {
        <<enumeration>>
        STRING
        NUMBER
        BOOLEAN
        JSON
    }

    class SystemLimit {
        -Long limitId
        -String limitName
        -Integer limitValue
        -LimitCategory category
        -LocalDateTime updatedAt
        +setLimit()
        +getLimit()
    }

    class LimitCategory {
        <<enumeration>>
        MAX_USERS
        MAX_PROJECTS
        MAX_FILE_SIZE
        SESSION_TIMEOUT
        API_RATE_LIMIT
    }

    class AuditLog {
        -Long logId
        -User user
        -String action
        -String entityType
        -Long entityId
        -String oldValue
        -String newValue
        -String ipAddress
        -LocalDateTime timestamp
        +logAction()
        +searchLogs()
    }

    class AuditLogType {
        <<enumeration>>
        CREATE_USER
        UPDATE_USER
        DELETE_USER
        UPDATE_CONFIG
        UPDATE_LIMIT
        LOGIN
        LOGOUT
    }

    User --> UserRole
    User --> UserStatus
    User "1" --> "*" AuditLog : performs
    User "1" --> "*" SystemConfig : updates
    User "1" --> "*" SystemLimit : updates
    SystemConfig --> ConfigType
    SystemLimit --> LimitCategory
    AuditLog --> AuditLogType

    style User fill:#f3e5f5
    style SystemConfig fill:#c8e6c9
    style SystemLimit fill:#c8e6c9
    style AuditLog fill:#ffe0b2
```

### Admin Class Model:
- **User**: Quản lý người dùng (ADMIN, MANAGER, ANNOTATOR, REVIEWER)
- **UserStatus**: ACTIVE, INACTIVE, SUSPENDED
- **SystemConfig**: Cấu hình hệ thống (key-value)
- **SystemLimit**: Giới hạn hệ thống
- **AuditLog**: Nhật ký hoạt động
- **AuditLogType**: Loại action được log

---

## 6️⃣ Admin - Sequence Diagram

```mermaid
sequenceDiagram
    participant Admin
    participant UserService
    participant SystemConfigService
    participant AuditLogService
    participant Database

    rect rgb(240, 220, 200)
    note right of Admin: 1. Tạo tài khoản người dùng
    Admin->>UserService: createUser(username, email, role)
    UserService->>UserService: validateInput()
    UserService->>Database: saveUser(user)
    Database-->>UserService: userId
    UserService->>AuditLogService: logAction("CREATE_USER")
    UserService-->>Admin: userCreated
    end

    rect rgb(240, 220, 200)
    note right of Admin: 2. Cập nhật vai trò người dùng
    Admin->>UserService: updateUserRole(userId, newRole)
    UserService->>Database: updateUser(user)
    Database-->>UserService: success
    UserService->>AuditLogService: logAction("UPDATE_USER_ROLE")
    UserService-->>Admin: roleUpdated
    end

    rect rgb(240, 220, 200)
    note right of Admin: 3. Vô hiệu hóa tài khoản
    Admin->>UserService: deactivateUser(userId)
    UserService->>Database: updateUserStatus("INACTIVE")
    Database-->>UserService: success
    UserService->>AuditLogService: logAction("DEACTIVATE_USER")
    UserService-->>Admin: userDeactivated
    end

    rect rgb(240, 200, 220)
    note right of Admin: 4. Cấu hình tham số hệ thống
    Admin->>SystemConfigService: updateSystemConfig(key, value)
    SystemConfigService->>SystemConfigService: validateConfig()
    SystemConfigService->>Database: saveConfig(settings)
    Database-->>SystemConfigService: success
    SystemConfigService->>AuditLogService: logAction("UPDATE_SYSTEM_CONFIG")
    SystemConfigService-->>Admin: configUpdated
    end

    rect rgb(240, 200, 220)
    note right of Admin: 5. Thiết lập giới hạn hệ thống
    Admin->>SystemConfigService: setSystemLimit(limitName, limitValue)
    SystemConfigService->>Database: saveLimit(limit)
    Database-->>SystemConfigService: success
    SystemConfigService->>AuditLogService: logAction("SET_SYSTEM_LIMIT")
    SystemConfigService-->>Admin: limitSet
    end

    rect rgb(220, 240, 200)
    note right of Admin: 6. Xem nhật ký hoạt động
    Admin->>AuditLogService: getAuditLogs(filters)
    AuditLogService->>Database: queryLogs(filters)
    Database-->>AuditLogService: logList
    AuditLogService-->>Admin: logReport
    end

    rect rgb(220, 240, 200)
    note right of Admin: 7. Xuất báo cáo hoạt động
    Admin->>AuditLogService: exportAuditReport(format)
    AuditLogService->>Database: getAllLogs()
    Database-->>AuditLogService: logs
    AuditLogService->>AuditLogService: convertToFormat(format)
    AuditLogService-->>Admin: reportFile
    end
```

### Admin Workflow (7 bước):
**Quản lý Người dùng (3):**
1. **Tạo tài khoản** → Validate, save, log action
2. **Cập nhật vai trò** → Update role, log change
3. **Vô hiệu hóa tài khoản** → Deactivate, log action

**Cấu hình Hệ thống (2):**
4. **Cấu hình tham số** → Validate, save settings
5. **Thiết lập giới hạn** → Set limits

**Quản lý Nhật ký (2):**
6. **Xem logs** → Query audit logs
7. **Xuất báo cáo** → Export report

---

## Architecture Stack

- **Backend**: Spring Boot 4.0.5 + Java 21
- **Database**: JPA/Hibernate
- **Frontend**: React + Vite
- **AI Service**: Python (YOLOv8)
- **API Documentation**: OpenAPI/Swagger

---

## Notes

✅ Tất cả chức năng của Manager đã hoàn thành (7/7)
✅ Quản lý người dùng & nhật ký của Admin đã hoàn thành (2/3)
⏳ Cấu hình hệ thống của Admin (1/3) - chưa có chức năng
🔄 AI hỗ trợ gán nhãn - tùy chọn, có AIService sẵn sàng

---

Last Updated: 2026-04-25
