import os

file_path = r'd:\9.GIAO TRINH MON HOC\NAM_3_KI_2_DOT_1\JAVA\label\IEEE_29148_SRS.md'

content = """
# 3. Specific Requirements

## 3.1 Functional Requirements

This section outlines the detailed functional requirements of the system, complete with Use Cases, Main/Alternative Flows, and Acceptance Criteria.

### 3.1.1 Authentication & Security Module (FR-01)
**Description:** The system must provide secure mechanisms for users to authenticate and maintain sessions.

**Use Case 1: Local Login**
- **Preconditions:** The user has registered an account and is active.
- **Main Flow:**
  1. User enters username and password.
  2. System validates credentials against the database.
  3. System generates a JWT access token and refresh token.
  4. System returns the tokens to the client.
- **Alternative Flow:** 
  - (2a) User enters wrong password. System returns 401 Unauthorized.
- **Postconditions:** User is authenticated and can access secured endpoints.
- **Acceptance Criteria:** 
  - Passwords must be hashed using Bcrypt.
  - Token must contain User ID, Roles, and Permissions in claims.

**Use Case 2: Google OAuth2 Login**
- **Preconditions:** User has a valid Google account.
- **Main Flow:**
  1. User clicks "Login with Google".
  2. Client receives Google ID token and sends it to backend `/api/auth/google`.
  3. Backend validates the Google token.
  4. If user doesn't exist, system auto-registers the user.
  5. System generates JWT and returns it.
- **Postconditions:** User is logged in via SSO.

**Use Case 3: Logout**
- **Main Flow:**
  1. User clicks logout.
  2. Client sends current JWT to `/api/auth/logout`.
  3. System adds the token ID (JTI) to the `invalidated_token` table.
- **Acceptance Criteria:** Blacklisted tokens cannot be used to access APIs, returning 401.

### 3.1.2 User Management Module (FR-02)
**Description:** The system allows administrators to manage users and their roles/permissions.

**Use Case 4: Manage Users (CRUD)**
- **Preconditions:** User has `MANAGE_USER` permission (usually ADMIN).
- **Main Flow:**
  1. Admin requests to view the user list.
  2. Admin can create, update, or delete a user.
  3. Admin can assign `Role` (ADMIN, MANAGER, ANNOTATOR, REVIEWER) to a user.
- **Acceptance Criteria:** Deleting a user with assigned tasks must either cascade delete tasks or restrict deletion.

### 3.1.3 Project Management Module (FR-03)
**Description:** Capabilities to organize annotation work into Projects.

**Use Case 5: Create and Configure Project**
- **Preconditions:** User has `MANAGE_PROJECT` permission.
- **Main Flow:**
  1. User inputs Project Name, Description, and Reviewer ID.
  2. System creates the Project with status `DRAFT`.
  3. Manager adds `Labels` (Name and Color) to the Project.
  4. Manager adds `ProjectMembers` (Users assigned to this project).
- **Postconditions:** A new project is created and ready to receive data.

### 3.1.4 Dataset Management Module (FR-04)
**Description:** Uploading and organizing images to be labeled.

**Use Case 6: Upload Data Items**
- **Preconditions:** Project exists and Manager is authenticated.
- **Main Flow:**
  1. Manager uploads an image file.
  2. System uploads the file to Cloudinary and retrieves the secure `fileUrl`.
  3. System creates a `DataItem` record linked to the Project with status `UNLABELED`.
- **Exception Flow:** Cloudinary API fails -> System aborts database save and returns 500 Error.

### 3.1.5 Annotation Workflow Module (FR-05)
**Description:** The core labeling functionality.

**Use Case 7: Annotate Data Item**
- **Preconditions:** User is ANNOTATOR and is a member of the project.
- **Main Flow:**
  1. Annotator requests the next `UNLABELED` or `REJECTED` item in the project.
  2. System returns the DataItem.
  3. Annotator draws bounding boxes and submits `Annotations` (label, xCenter, yCenter, width, height).
  4. System saves Annotations, updates DataItem status to `REVIEWING`.
- **Alternative Flow:**
  - Annotator skips the item. Status remains unchanged.
- **Acceptance Criteria:** Tightly coupled Business Rule: Annotators can only access projects they are assigned to (Enforce BOLA/IDOR protection).

### 3.1.6 Review Workflow Module (FR-06)
**Description:** Quality assurance for annotations.

**Use Case 8: Approve/Reject Data**
- **Preconditions:** User has `REVIEW_DATA` permission.
- **Main Flow (Approve):**
  1. Reviewer fetches a `REVIEWING` data item.
  2. Reviewer clicks Approve.
  3. System changes DataItem status to `APPROVED`.
  4. System records action in `ReviewLog`.
- **Alternative Flow (Reject):**
  1. Reviewer clicks Reject and provides a `rejectReason`.
  2. System changes status to `REJECTED`.
  3. System records in `ReviewLog`.
- **Postconditions:** Item is ready for export (if approved) or re-annotation (if rejected).

### 3.1.7 Export and Audit Module (FR-07)
**Description:** Outputting data and tracing activities.

**Use Case 9: Export Dataset**
- **Preconditions:** User has `EXPORT_DATA` permission.
- **Main Flow:**
  1. User requests export for a specific Project.
  2. System gathers all `APPROVED` data items and their annotations.
  3. System formats output as JSON/CSV/YOLO text files.
  4. System returns the file to the client.

**Use Case 10: System Audit Logging**
- **Description:** Every sensitive API call (Create, Update, Delete) is intercepted (likely via AOP/Interceptor) and a record is created in `AuditLog` containing username, action, target entity, details, IP address, and timestamp.

## 3.2 Non-Functional Requirements

### 3.2.1 Performance Requirements
- **Response Time:** API endpoints (excluding file uploads) must respond within 500ms under normal load.
- **Throughput:** The system must handle concurrent annotation submissions from at least 100 users.

### 3.2.2 Security Requirements
- **Authentication:** All endpoints except `/api/auth/**` must require a valid JWT.
- **Authorization:** Method-level security (e.g., `@PreAuthorize`) must be implemented to check permissions against user roles.
- **Data Protection:** Passwords must not be stored in plain text. JWT Tokens must be signed using HMAC SHA-512 with a minimum 256-bit secret key.

### 3.2.3 Reliability and Availability
- **Cloud Dependency:** The system depends on Cloudinary for image delivery. If Cloudinary is down, the system should gracefully fail and alert the user.
- **Database Transactions:** Operations spanning multiple tables (e.g., deleting a user and their tokens) must be transactional to prevent orphaned records.

### 3.2.4 Maintainability
- The backend codebase must follow clean architecture principles, separating Controllers, Services, and Repositories.
- MapStruct should be used for all DTO to Entity conversions to avoid boilerplate code.

## 3.3 Business Rules
- **BR-01 (Role Exclusivity):** An ADMIN has all permissions implicitly.
- **BR-02 (Data Privacy):** A user cannot view `DataItems` of a `Project` unless they are explicitly added to the `ProjectMember` table or have the `MANAGE_PROJECT` system-wide permission.
- **BR-03 (State Machine):** A `DataItem` must follow the transition: `UNLABELED` -> `REVIEWING` -> (`APPROVED` or `REJECTED`). `REJECTED` -> `REVIEWING`. Only `APPROVED` data can be exported.
- **BR-04 (Maintenance Mode):** If `SystemConfig` key `SYSTEM_MAINTENANCE` is set to `true`, only ADMIN users can log in or perform actions.
"""

with open(file_path, "a", encoding="utf-8") as f:
    f.write(content)
