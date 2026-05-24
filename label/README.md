# 🏷️ Labeling Platform

Hệ thống quản lý gán nhãn dữ liệu (Data Labeling) xây dựng trên **Spring Boot 4.0.5** + **MySQL 8** + **JWT Authentication**.

Hỗ trợ quản lý dự án, phân công annotator, review nhãn, export dữ liệu, đăng nhập bằng Google OAuth2.

---

## 📋 Mục lục

- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Chạy nhanh với Docker (Khuyến nghị)](#-cách-1-chạy-với-docker-compose-khuyến-nghị)
- [Chạy local (Không Docker)](#-cách-2-chạy-local-không-docker)
- [Tài khoản mặc định](#-tài-khoản-mặc-định)
- [API Documentation](#-api-documentation)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Cấu hình](#-cấu-hình)

---

## 💻 Yêu cầu hệ thống

### Cách 1: Docker (Khuyến nghị)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) >= 4.0
- Docker Compose (đã tích hợp sẵn trong Docker Desktop)

### Cách 2: Chạy local
- **Java 21** (JDK) — [Download](https://adoptium.net/)
- **MySQL 8.0** — [Download](https://dev.mysql.com/downloads/)
- **Maven 3.9+** (hoặc dùng Maven Wrapper `./mvnw` đã có sẵn)

---

## 🐳 Cách 1: Chạy với Docker Compose (Khuyến nghị)

Chỉ cần **3 bước** để chạy toàn bộ hệ thống:

### Bước 1: Clone dự án

```bash
git clone <repository-url>
cd label
```

### Bước 2: Tạo file cấu hình

```bash
# Copy file mẫu
cp .env.example .env

# (Tùy chọn) Sửa file .env nếu muốn thay đổi mật khẩu DB, JWT key, v.v.
```

### Bước 3: Khởi chạy

```bash
docker compose up -d
```

> ⏳ Lần đầu chạy sẽ mất **3-5 phút** để tải Docker images và build ứng dụng.

### Kiểm tra trạng thái

```bash
# Xem logs
docker compose logs -f app

# Kiểm tra services đang chạy
docker compose ps
```

### Dừng hệ thống

```bash
# Dừng nhưng giữ dữ liệu
docker compose down

# Dừng và XÓA toàn bộ dữ liệu (volume)
docker compose down -v
```

``` bash
# Chạy ui của app
cd data-labeling ui
npm run dev
```


---

## 💻 Cách 2: Chạy Local (Không Docker)

### Bước 1: Cài đặt MySQL

Cài MySQL 8.0 và tạo database:

```sql
CREATE DATABASE labeling CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> Mặc định app kết nối `localhost:3306` với user `root`, password `123456`.  
> Nếu khác, sửa trong file `src/main/resources/application.yaml` hoặc set biến môi trường.





### Bước 2: Clone và chạy

```bash
git clone <repository-url>
cd label

# Windows
mvnw.cmd spring-boot:run

# Linux/macOS
chmod +x mvnw
./mvnw spring-boot:run
```

### Bước 3: Kiểm tra

Mở trình duyệt: [http://localhost:8080/api/swagger-ui/index.html](http://localhost:8080/api/swagger-ui/index.html)

---
``` bash
# Chạy ui của app
cd data-labeling ui
npm run dev
```
## 👤 Tài khoản mặc định

Khi chạy lần đầu (database trống), hệ thống tự động tạo:

| Thông tin    | Giá trị   |
|-------------|-----------|
| **Username** | `admin`   |
| **Password** | `admin`   |
| **Role**     | `ADMIN`   |

> ⚠️ **QUAN TRỌNG**: Hãy đổi mật khẩu admin ngay sau lần đăng nhập đầu tiên!

### Dữ liệu được tạo tự động

Hệ thống tự động seed khi database trống:

- **4 Roles**: `ADMIN`, `MANAGER`, `ANNOTATOR`, `REVIEWER`
- **11 Permissions**: `CREATE_DATA`, `UPDATE_DATA`, `DELETE_DATA`, `APPROVE_DATA`, `REJECT_DATA`, `MANAGE_PROJECT`, `MANAGE_USER`, `VIEW_REPORT`, `EXPORT_DATA`, `ANNOTATE_DATA`, `REVIEW_DATA`
- **System Config**: `SYSTEM_MAINTENANCE=false`, `ALLOW_USER_REGISTRATION=true`

---

## 📖 API Documentation

Sau khi chạy, truy cập Swagger UI:

```
http://localhost:8080/api/swagger-ui/index.html
```

### Các endpoint chính

| Method | Endpoint                | Mô tả                    | Auth    |
|--------|------------------------|---------------------------|---------|
| POST   | `/api/auth/token`      | Đăng nhập, lấy JWT token | Public  |
| POST   | `/api/auth/google`     | Đăng nhập bằng Google    | Public  |
| POST   | `/api/auth/refresh`    | Refresh token             | Public  |
| POST   | `/api/auth/logout`     | Đăng xuất                 | Public  |
| POST   | `/api/users`           | Tạo tài khoản mới        | Public  |
| GET    | `/api/users`           | Danh sách users           | Public  |
| GET    | `/api/users/myInfo`    | Thông tin user hiện tại   | Auth    |
| POST   | `/api/projects`        | Tạo dự án mới            | Auth    |
| GET    | `/api/projects`        | Danh sách dự án           | Auth    |
| POST   | `/api/annotations`     | Gán nhãn                  | Auth    |
| GET    | `/api/roles`           | Danh sách roles           | Auth    |
| GET    | `/api/permissions`     | Danh sách permissions     | Auth    |

---

## 📁 Cấu trúc dự án

```
label/
├── src/main/java/com/project/label/
│   ├── LabelApplication.java          # Entry point
│   ├── configuration/                  # Security, JWT, Cloudinary, Init config
│   │   ├── ApplicationInitConfig.java  # ⭐ Seed dữ liệu ban đầu
│   │   ├── SecurityConfig.java         # Spring Security + CORS
│   │   ├── CustomJwtDecoder.java       # JWT decoder tùy chỉnh
│   │   └── CloudinaryConfig.java       # Cấu hình Cloudinary
│   ├── controller/                     # REST API controllers
│   ├── service/                        # Business logic
│   ├── repository/                     # JPA repositories
│   ├── entity/                         # JPA entities
│   ├── dto/                            # Request/Response DTOs
│   │   ├── request/
│   │   └── response/
│   ├── mapper/                         # MapStruct mappers
│   ├── enums/                          # Enum definitions
│   ├── exception/                      # Custom exceptions
│   └── validator/                      # Custom validators
├── src/main/resources/
│   └── application.yaml                # Cấu hình ứng dụng
├── Dockerfile                          # Multi-stage Docker build
├── docker-compose.yml                  # Docker Compose config
├── .env.example                        # Template biến môi trường
├── pom.xml                             # Maven dependencies
└── README.md                           # 📄 File này
```

---

## ⚙️ Cấu hình

### Biến môi trường

Tất cả cấu hình có thể override qua biến môi trường:

| Biến                    | Mặc định                        | Mô tả                        |
|------------------------|----------------------------------|-------------------------------|
| `MYSQL_HOST`           | `localhost`                      | Hostname MySQL server         |
| `MYSQL_PORT`           | `3306`                           | Port MySQL                    |
| `MYSQL_DATABASE`       | `labeling`                       | Tên database                  |
| `MYSQL_USER`           | `root`                           | MySQL username                |
| `MYSQL_PASSWORD`       | `123456`                         | MySQL password                |
| `JWT_SIGNER_KEY`       | `be4a8798...`                    | Secret key cho JWT (HS512)    |
| `CLOUDINARY_CLOUD_NAME`| `djcvbbhup`                     | Cloudinary cloud name         |
| `CLOUDINARY_API_KEY`   | `915878471116958`                | Cloudinary API key            |
| `CLOUDINARY_API_SECRET`| `Wo8Zrd_XgB-_5ZHj2fYQyXCzzns`   | Cloudinary API secret         |
| `GOOGLE_CLIENT_ID`     | _(không có default)_             | Google OAuth2 Client ID       |
| `GOOGLE_CLIENT_SECRET` | _(không có default)_             | Google OAuth2 Client Secret   |

### Google OAuth2 (Tùy chọn)

Nếu muốn sử dụng tính năng đăng nhập Google:

1. Tạo project tại [Google Cloud Console](https://console.cloud.google.com/)
2. Bật API **Google Identity** 
3. Tạo **OAuth 2.0 Client ID** (Web Application)
4. Thêm `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` vào file `.env`

### Cloudinary (Upload ảnh)

Dự án sử dụng Cloudinary để upload và lưu trữ hình ảnh dữ liệu:

1. Tạo tài khoản tại [Cloudinary](https://cloudinary.com/)
2. Lấy `Cloud Name`, `API Key`, `API Secret` từ Dashboard
3. Cập nhật vào file `.env`

---

## 🛠️ Các lệnh hữu ích

```bash
# Build JAR (không chạy tests)
./mvnw package -DskipTests

# Chạy tests
./mvnw test

# Build lại Docker image
docker compose build --no-cache

# Xem logs MySQL
docker compose logs -f mysql

# Kết nối vào MySQL container
docker compose exec mysql mysql -u root -p123456 labeling

# Restart chỉ app (không restart MySQL)
docker compose restart app
```

---

## 📝 Tech Stack

| Công nghệ          | Version  | Mục đích                       |
|--------------------|----------|--------------------------------|
| Spring Boot        | 4.0.5    | Backend framework              |
| Spring Security    | -        | Authentication & Authorization |
| Spring Data JPA    | -        | ORM & Database access          |
| MySQL              | 8.0      | Relational database            |
| JWT (Nimbus)       | -        | Token-based authentication     |
| MapStruct          | 1.6.3    | Object mapping                 |
| Lombok             | -        | Boilerplate reduction          |
| Cloudinary         | 1.39.0   | Image upload & storage         |
| Google API Client  | 2.7.2    | Google OAuth2 integration      |
| SpringDoc OpenAPI  | 3.0.2    | Swagger API documentation      |
| Docker             | -        | Containerization               |
