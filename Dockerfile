# Build Stage
FROM gradle:8.5-jdk21 AS build
WORKDIR /app

# 의존성 캐싱을 위한 레이어 분리
COPY gradle.properties settings.gradle.kts build.gradle.kts gradlew ./
COPY gradle ./gradle
COPY app/api/build.gradle.kts ./app/api/

# 의존성만 먼저 다운로드 (레이어 캐싱)
RUN ./gradlew :app:api:dependencies --no-daemon --offline || ./gradlew :app:api:dependencies --no-daemon

# 소스 코드 복사 및 빌드
COPY app ./app
RUN ./gradlew :app:api:bootJar --no-daemon --parallel

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
