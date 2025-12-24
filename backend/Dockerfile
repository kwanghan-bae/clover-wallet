# Build Stage
FROM gradle:8.5-jdk21 AS build
WORKDIR /app

# 빌드 파일 복사 (캐싱 레이어)
COPY gradle.properties settings.gradle.kts build.gradle.kts gradlew ./
COPY gradle ./gradle
COPY app/api/build.gradle.kts ./app/api/

# 소스 코드 복사 및 빌드 (한 번에 처리 - Render 환경 최적화)
COPY app ./app
RUN ./gradlew :app:api:bootJar --no-daemon --parallel --quiet

# Run Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# 보안: non-root 사용자로 실행
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# JAR 파일 복사
COPY --from=build --chown=spring:spring /app/app/api/build/libs/*.jar app.jar

# 메타데이터
LABEL maintainer="clover-wallet"
LABEL version="1.0"

# 포트 노출
EXPOSE 8080

# JVM 최적화 옵션
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-XX:+UseG1GC", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
