import os

file_path = r'd:\9.GIAO TRINH MON HOC\NAM_3_KI_2_DOT_1\JAVA\label\IEEE_29148_SRS.md'

content = """
## 3.6 API Specifications

This section specifies the RESTful endpoints used by the platform.

### 3.6.1 Authentication API
**POST `/api/auth/token`**
- **Description:** Authenticate user and issue JWT.
- **Request Body:** `{"username": "string", "password": "string"}`
- **Response Body:** `{"code": 1000, "result": {"token": "jwt_string", "authenticated": true}}`
- **Validation Rules:** Username and password cannot be blank.
- **Error Codes:** 401 Unauthorized (Invalid credentials).

**POST `/api/auth/google`**
- **Description:** Login using Google OAuth2.
- **Request Body:** `{"token": "google_id_token"}`
- **Response Body:** `{"code": 1000, "result": {"token": "jwt_string"}}`
- **Validation Rules:** Token must be a valid Google-issued JWT.

### 3.6.2 User API
**POST `/api/users/register`**
- **Description:** Create a new user account.
- **Request Body:** `{"username": "str", "password": "str", "email": "str"}`
- **Response Body:** User profile data without password.
- **Validation Rules:** Username and Email must be unique. Password > 6 chars.
- **Error Codes:** 400 Bad Request (Duplicate username).

**GET `/api/users/myInfor`**
- **Description:** Retrieve current authenticated user's info.
- **Header:** `Authorization: Bearer <jwt>`
- **Response Body:** `{ "id": "...", "username": "...", "roles": [...] }`

### 3.6.3 Project API
**POST `/api/projects`**
- **Description:** Create a new annotation project.
- **Header:** `Authorization: Bearer <jwt>`
- **Request Body:** `{"name": "Detect Cars", "description": "...", "reviewerId": "..."}`
- **Response Body:** Project entity.
- **Validation Rules:** User must have MANAGE_PROJECT permission.

### 3.6.4 Annotation API
**POST `/api/annotations`**
- **Description:** Submit annotations for a DataItem.
- **Header:** `Authorization: Bearer <jwt>`
- **Request Body:** 
  ```json
  {
    "dataItemId": "uuid",
    "annotations": [
      {"labelId": "uuid", "xCenter": 0.5, "yCenter": 0.5, "width": 0.1, "height": 0.1}
    ]
  }
  ```
- **Response Body:** Success message.
- **Validation Rules:** Coordinates must be between 0 and 1. DataItem status must be UNLABELED or REJECTED.

---

# 4. UML Artifacts (System Models)

Below are the PlantUML codes representing various UML diagrams for the Data Labeling Platform.

## 4.1 Use Case Diagram
This diagram shows interactions between Stakeholders and System Use Cases.

```plantuml
@startuml
left to right direction
actor "Administrator" as Admin
actor "Project Manager" as Manager
actor "Annotator" as Annotator
actor "Reviewer" as Reviewer

package "Data Labeling Platform" {
  usecase "Login / Google OAuth" as UC1
  usecase "Manage Users & Roles" as UC2
  usecase "Manage Projects" as UC3
  usecase "Upload Datasets" as UC4
  usecase "Draw Annotations" as UC5
  usecase "Approve/Reject Data" as UC6
  usecase "Export Dataset" as UC7
}

Admin --> UC1
Manager --> UC1
Annotator --> UC1
Reviewer --> UC1

Admin --> UC2
Manager --> UC3
Manager --> UC4
Manager --> UC7
Annotator --> UC5
Reviewer --> UC6
@enduml
```

## 4.2 Class Diagram
This diagram models the core Entity classes and their relationships.

```plantuml
@startuml
class User {
  - id: UUID
  - username: String
  - password: String
  + login()
}

class Role {
  - name: String
}

class Project {
  - id: UUID
  - name: String
  - status: Enum
  + addMember()
}

class DataItem {
  - id: UUID
  - fileUrl: String
  - status: Enum
}

class Annotation {
  - id: UUID
  - xCenter: Double
  - yCenter: Double
}

class Label {
  - id: UUID
  - name: String
  - color: String
}

User "*" -- "*" Role : has >
User "1" -- "*" Project : manages >
Project "1" *-- "*" DataItem : contains >
Project "1" *-- "*" Label : defines >
DataItem "1" *-- "*" Annotation : has >
Annotation "*" -- "1" Label : tagged with >
@enduml
```

## 4.3 Sequence Diagram
Illustrates the flow of Annotating a Data Item.

```plantuml
@startuml
actor Annotator
boundary "UI / Frontend" as UI
control "AnnotationController" as API
entity "DataItem" as DB
entity "Annotation" as AnnDB

Annotator -> UI: Requests next item
UI -> API: GET /api/datasets/next/{projectId}
API -> DB: fetch(UNLABELED)
DB --> API: DataItem
API --> UI: Display Image & Labels

Annotator -> UI: Draws Bounding Box
Annotator -> UI: Clicks Submit
UI -> API: POST /api/annotations
API -> AnnDB: Save(label, coordinates)
API -> DB: Update Status = REVIEWING
API --> UI: Success Response
@enduml
```

## 4.4 Activity Diagram
Shows the lifecycle of a Data Item.

```plantuml
@startuml
start
:Manager Uploads Image;
:DataItem Created (UNLABELED);
repeat
  :Annotator fetches DataItem;
  :Annotator Submits Annotations;
  :Status changes to REVIEWING;
  :Reviewer Inspects DataItem;
  if (Is Quality Good?) then (Yes)
    :Status changes to APPROVED;
    :ReviewLog Created;
    break
  else (No)
    :Status changes to REJECTED;
    :ReviewLog Created (with Reason);
  endif
repeat while (Status is REJECTED)
:Manager Exports Dataset;
stop
@enduml
```

## 4.5 Entity-Relationship (ER) Diagram
Represents the database schema.

```plantuml
@startuml
entity "users" as u {
  * id : varchar(36) <<PK>>
  --
  username : varchar(255)
  password : varchar(255)
}

entity "roles" as r {
  * name : varchar(50) <<PK>>
}

entity "projects" as p {
  * id : varchar(36) <<PK>>
  --
  name : varchar(255)
  manager_id : varchar(36) <<FK>>
}

entity "data_items" as d {
  * id : varchar(36) <<PK>>
  --
  project_id : varchar(36) <<FK>>
  status : varchar(50)
  file_url : text
}

entity "annotations" as a {
  * id : varchar(36) <<PK>>
  --
  data_item_id : varchar(36) <<FK>>
  label_id : varchar(36) <<FK>>
}

u ||--o{ p : "manages"
p ||--o{ d : "contains"
d ||--o{ a : "has"
@enduml
```

---

# 5. Requirement Traceability Matrix (RTM)

The RTM ensures all requirements are mapped to their respective use cases, API endpoints, and Database Entities.

| Req ID | Requirement Description | Use Case | API Endpoint | DB Entity |
|--------|-------------------------|----------|--------------|-----------|
| FR-01  | User Login (Local)      | UC1      | `POST /api/auth/token` | User |
| FR-01  | User Login (Google)     | UC2      | `POST /api/auth/google`| User |
| FR-02  | Manage Users            | UC4      | `POST /api/users`      | User, Role|
| FR-03  | Create Project          | UC5      | `POST /api/projects`   | Project   |
| FR-04  | Upload Dataset Image    | UC6      | `POST /api/datasets/upload`| DataItem  |
| FR-05  | Annotate Image          | UC7      | `POST /api/annotations`| Annotation|
| FR-06  | Approve/Reject Item     | UC8      | `POST /api/reviews/{id}/approve` | ReviewLog |
| FR-07  | Export Dataset          | UC9      | `GET /api/export/{id}` | Project, DataItem|
| NFR-02 | RBAC Security           | All      | Interceptors / SecurityConfig | Permission|

---
**End of Document**
"""

with open(file_path, "a", encoding="utf-8") as f:
    f.write(content)
