# Tài Liệu Đặc Tả Yêu Cầu Phần Mềm (SRS) - Hướng Kiểm Thử (Testing-Oriented)
**Dự án:** Data Labeling Platform (Nền tảng Gán nhãn Dữ liệu)

---

## 1. Mục Đích Tài Liệu
Tài liệu SRS này được biên soạn đặc thù nhằm phục vụ quá trình **Kiểm thử phần mềm (Software Testing)**. Tài liệu bám sát cấu trúc của mã nguồn thực tế (Controllers, Entities) để cung cấp một cái nhìn chi tiết về các chức năng, quyền hạn và các luồng nghiệp vụ cần thiết kế Test Case.

## 2. Mô Tả Tổng Quan Hệ Thống
Hệ thống là một ứng dụng Web hỗ trợ quy trình gán nhãn dữ liệu (Data Labeling). Bao gồm: 
- Quản lý người dùng và phân quyền linh hoạt.
- Quản lý các dự án gán nhãn.
- Đẩy dữ liệu (Data Items) lên hệ thống (tích hợp Cloudinary).
- Thực hiện gán nhãn (Annotation) và duyệt nhãn (Review).
- Xuất dữ liệu hoàn thiện.

---

## 3. Các Tác Nhân (Actors) & Phân Quyền
Hệ thống có **4 Roles mặc định**:
1. **ADMIN**: Toàn quyền trong hệ thống.
2. **MANAGER**: Quản lý dự án, quản lý data, quản lý thành viên dự án.
3. **ANNOTATOR**: Thực hiện gán nhãn các dữ liệu được phân công.
4. **REVIEWER**: Thực hiện kiểm tra, phê duyệt (Approve) hoặc từ chối (Reject) các dữ liệu đã được Annotator gán nhãn.

**11 Permissions chính cần kiểm thử quyền truy cập:**
`CREATE_DATA`, `UPDATE_DATA`, `DELETE_DATA`, `APPROVE_DATA`, `REJECT_DATA`, `MANAGE_PROJECT`, `MANAGE_USER`, `VIEW_REPORT`, `EXPORT_DATA`, `ANNOTATE_DATA`, `REVIEW_DATA`.

---

## 4. Yêu Cầu Chức Năng (Functional Requirements) & Hướng Dẫn Kiểm Thử

Dưới đây là các Module chức năng dựa trên API của hệ thống (Controllers).

### 4.1. Module Xác Thực & Phân Quyền (Authentication & Authorization)
*API Liên quan: `AuthenticationController`, `RoleController`, `PermissionController`*

| Mã | Chức năng | Mô tả & Hướng dẫn Test (Test Scenarios) |
|----|-----------|------------------------------------------|
| **AUTH-01** | Đăng nhập hệ thống (Form) | - **Test Case**: Nhập đúng/sai username, password.<br>- **Kỳ vọng**: Trả về JWT token khi đúng; lỗi 401 khi sai. |
| **AUTH-02** | Đăng nhập Google OAuth2 | - **Test Case**: Xác thực qua token của Google.<br>- **Kỳ vọng**: Trả về JWT hợp lệ từ server. |
| **AUTH-03** | Refresh Token | - **Test Case**: Gửi Refresh token còn hạn/hết hạn.<br>- **Kỳ vọng**: Cấp lại Access token mới hoặc báo lỗi expired. |
| **AUTH-04** | Đăng xuất (Logout) | - **Test Case**: Call API logout với token hiện tại.<br>- **Kỳ vọng**: Token bị đưa vào bảng `InvalidatedToken` (Blacklist). Không thể dùng token đó nữa. |

### 4.2. Module Quản Lý Người Dùng (User Management)
*API Liên quan: `UserController`*

| Mã | Chức năng | Mô tả & Hướng dẫn Test (Test Scenarios) |
|----|-----------|------------------------------------------|
| **USR-01** | Lấy thông tin cá nhân | - **Test Case**: Gọi API `/myInfo` với JWT.<br>- **Kỳ vọng**: Trả về đúng thông tin user của token hiện tại. |
| **USR-02** | Tạo tài khoản (Register/Admin Create) | - **Test Case**: Tạo tài khoản trùng Username/Email. Mật khẩu yếu (nếu có validate).<br>- **Kỳ vọng**: Trả về lỗi 400 Bad Request. Dữ liệu hợp lệ thì tạo thành công. |
| **USR-03** | Quản lý Users (Admin) | - **Test Case**: Admin xem list, sửa, xóa user. Gán Role cho User.<br>- **Kỳ vọng**: Các quyền khác gọi API này bị 403 Forbidden. |

### 4.3. Module Quản Lý Dự Án (Project Management)
*API Liên quan: `ProjectController`*

| Mã | Chức năng | Mô tả & Hướng dẫn Test (Test Scenarios) |
|----|-----------|------------------------------------------|
| **PRO-01** | Tạo / Sửa / Xóa Dự án | - **Test Case**: Tạo dự án thiếu tên. Xóa dự án đang chứa dữ liệu.<br>- **Kỳ vọng**: Có validation. Xóa dự án cần kiểm tra quan hệ khóa ngoại (Entity: `Project`). |
| **PRO-02** | Danh sách Dự án | - **Test Case**: Phân trang (Pagination) dự án.<br>- **Kỳ vọng**: Trả về số lượng item đúng theo size/page. |
| **PRO-03** | Quản lý Project Member | - **Test Case**: Thêm user vào dự án (`ProjectMember`), xóa thành viên ra khỏi dự án.<br>- **Kỳ vọng**: Chỉ thành viên trong dự án mới thao tác được với Data Items của dự án đó. |

### 4.4. Module Quản Lý Dữ Liệu (Dataset / Data Items)
*API Liên quan: `DatasetController`, `LabelController`*

| Mã | Chức năng | Mô tả & Hướng dẫn Test (Test Scenarios) |
|----|-----------|------------------------------------------|
| **DAT-01** | Upload Data Items | - **Test Case**: Upload file (ảnh) lên dự án, test dung lượng lớn, định dạng không hỗ trợ.<br>- **Kỳ vọng**: Cloudinary xử lý và trả về URL, lưu vào DB `DataItem`. |
| **DAT-02** | Quản lý Data Items (CRUD) | - **Test Case**: Lấy danh sách item theo trạng thái (UNLABELED, LABELED...). |
| **DAT-03** | Quản lý Danh mục Nhãn (Labels) | - **Test Case**: Tạo nhãn cho dự án, dùng nhãn đó để gán.<br>- **Kỳ vọng**: Nhãn (Entity: `Label`) liên kết đúng với dự án. |

### 4.5. Module Gán Nhãn (Annotation) & Review
*API Liên quan: `AnnotationController`, `ReviewController`*

| Mã | Chức năng | Mô tả & Hướng dẫn Test (Test Scenarios) |
|----|-----------|------------------------------------------|
| **ANN-01** | Gán nhãn cho Data | - **Test Case**: Annotator gán nhãn cho một `DataItem`.<br>- **Kỳ vọng**: Tạo bản ghi `Annotation`. Status của DataItem đổi từ `UNLABELED` -> `LABELED` hoặc `REVIEWING`. |
| **REV-01** | Review (Approve/Reject) | - **Test Case**: Reviewer gọi API approve/reject một nhãn.<br>- **Kỳ vọng**: Ghi lại lịch sử vào `ReviewLog`. Nếu Approve, data có thể được export. Nếu Reject, status data quay về để Annotator sửa lại. |

### 4.6. Module Trích Xuất (Export) & Audit
*API Liên quan: `ExportController`, `AuditLogController`, `SystemConfigController`*

| Mã | Chức năng | Mô tả & Hướng dẫn Test (Test Scenarios) |
|----|-----------|------------------------------------------|
| **EXP-01** | Xuất dữ liệu | - **Test Case**: Export data của một Project ở định dạng JSON/CSV. Chỉ export data đã `APPROVED`.<br>- **Kỳ vọng**: File xuất ra đúng format và đầy đủ dữ liệu. |
| **AUD-01** | Audit Log (Nhật ký hệ thống) | - **Test Case**: Admin xem lịch sử các hành động (Tạo data, xóa user...).<br>- **Kỳ vọng**: Entity `AuditLog` lưu đúng user tác động, hành động, thời gian. |
| **SYS-01** | Cấu hình hệ thống | - **Test Case**: Bật cờ `SYSTEM_MAINTENANCE=true` hoặc `ALLOW_USER_REGISTRATION=false`.<br>- **Kỳ vọng**: User thường không thể thao tác hoặc đăng ký khi đang bảo trì. |

---

## 5. Yêu Cầu Phi Chức Năng (Non-Functional Requirements)

1. **Bảo mật (Security):**
   - Tất cả API (trừ `/api/auth/*` và đăng ký) phải đính kèm Header `Authorization: Bearer <token>`.
   - Mật khẩu lưu trong DB phải được hash (Bcrypt).
   - Kiểm tra **BOLA (Broken Object Level Authorization)**: Annotator A không thể gán nhãn, sửa xóa data của Project B mà A không tham gia.
2. **Hiệu suất (Performance):**
   - API phân trang (Projects, Users, Data Items) phải có thời gian phản hồi `< 500ms`.
3. **Tính ổn định (Reliability):**
   - Các API upload ảnh phải xử lý tốt khi Cloudinary trả về lỗi (Timeout, Error 500). Cần rollback Transaction (không lưu vào DB nếu upload ảnh lỗi).

---

## 6. Môi Trường Kiểm Thử (Test Environment)
- **Công cụ API Testing:** Postman, Insomnia hoặc trực tiếp qua Swagger UI (`http://localhost:8080/api/swagger-ui/index.html`).
- **Database Checking:** Kết nối MySQL qua DBeaver hoặc DataGrip (`localhost:3306`, user: `root`, pass: `123456`, db: `labeling`) để kiểm tra tính toàn vẹn của dữ liệu sau khi chạy API.
- **Tài khoản mặc định Test:** Username `admin` / Password `admin` (Role ADMIN).

---
*Tài liệu này được tạo ra để QA/Tester dùng làm cơ sở viết Test Cases (Manual/Automation) bao phủ toàn bộ Business Logic của hệ thống.*
