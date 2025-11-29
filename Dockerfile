# Build Stage
FROM gradle:8.5-jdk21 AS build
WORKDIR /app

# 의존성 캐싱을 위해 설정 파일만 먼저 복사
COPY settings.gradle.kts build.gradle.kts gradlew ./
COPY gradle ./gradle
COPY app/api/build.gradle.kts ./app/api/
COPY infra/rdb/build.gradle.kts ./infra/rdb/

# 의존성 다운로드 (소스 코드 없이)
RUN ./gradlew dependencies --no-daemon

# 소스 코드 복사 및 빌드
COPY . .
RUN ./gradlew :app:api:bootJar --no-daemon

# Run Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/app/api/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
