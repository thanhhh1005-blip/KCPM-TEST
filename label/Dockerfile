# ========================
# Stage 1: Build
# ========================
FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

# Copy Maven wrapper và pom.xml trước để cache dependencies
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Cấp quyền thực thi cho Maven wrapper
RUN chmod +x mvnw

# Tải dependencies (layer này sẽ được cache nếu pom.xml không đổi)
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build JAR (skip tests cho nhanh)
RUN ./mvnw package -DskipTests -B

# ========================
# Stage 2: Runtime
# ========================
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy JAR từ stage build
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]
