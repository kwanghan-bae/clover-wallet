import org.springframework.boot.gradle.tasks.bundling.BootJar

// Versions
val kotlinVersion by extra("1.9.23")
val ktlintVersion by extra("11.3.1")
val kotlinCoroutinesVersion by extra("1.8.0")
val kotestVersion by extra("5.5.0")
val kotestSpringExtensionVersion by extra("1.1.2")
val mockkVersion by extra("1.13.4")
val springBootVersion by extra("3.2.5")
val springDocOpenApiUiVersion by extra("1.6.15")
val springDocOpenApiUiPluginVersion by extra("1.6.0")
val springDependencyManagementPluginVersion by extra("1.1.0")
val springCloudDependencyManagementVersion by extra("2023.0.1")
val h2Version by extra("2.1.214")
val jsoupVersion by extra("1.15.4")
val postgresqlVersion by extra("42.7.2")

plugins {
    id("org.springframework.boot") version "3.2.5"
    id("io.spring.dependency-management") version "1.1.0"
    id("org.springdoc.openapi-gradle-plugin") version "1.6.0"
    kotlin("jvm") version "1.9.23"
    kotlin("plugin.spring") version "1.9.23"
    kotlin("plugin.jpa") version "1.9.23"
    id("org.jlleitschuh.gradle.ktlint") version "11.3.1"
    id("jacoco") // Jacoco 플러그인 추가
}

repositories {
    mavenCentral()
}

subprojects {
    apply(plugin = "org.springframework.boot")
    apply(plugin = "io.spring.dependency-management")
    apply(plugin = "org.jetbrains.kotlin.jvm")
    apply(plugin = "org.jetbrains.kotlin.plugin.spring")
    apply(plugin = "jacoco") // 서브모듈에 Jacoco 적용

    group = "com.clover.wallet"

    java {
        toolchain {
            languageVersion.set(JavaLanguageVersion.of(21))
        }
    }

    repositories {
        mavenCentral()
    }

    dependencies {
        implementation("org.springframework.boot:spring-boot-starter-validation")
        testImplementation("org.springframework.boot:spring-boot-starter-test")
        testImplementation("io.kotest:kotest-runner-junit5:${rootProject.extra["kotestVersion"]}")
        testImplementation("io.kotest:kotest-assertions-core:${rootProject.extra["kotestVersion"]}")
        testImplementation(
            "io.kotest.extensions:kotest-extensions-spring:${rootProject.extra["kotestSpringExtensionVersion"]}",
        )
        testImplementation("io.mockk:mockk:${rootProject.extra["mockkVersion"]}")
    }

    val bootJar = tasks.bootJar.get()
    val jar = tasks.jar.get()

    if (project.path.startsWith(":app:")) {
        bootJar.enabled = true
        jar.enabled = false
    } else {
        bootJar.enabled = false
        jar.enabled = true
    }
    tasks {
        compileKotlin {
            kotlinOptions {
                freeCompilerArgs = listOf("-Xjsr305=strict")
                jvmTarget = "21"
            }
            dependsOn(processResources) // kotlin 에서 ConfigurationProperties
        }

        compileTestKotlin {
            kotlinOptions {
                freeCompilerArgs = listOf("-Xjsr305=strict")
                jvmTarget = "21"
            }
            dependsOn(processResources) // kotlin 에서 ConfigurationProperties
        }
        test {
            useJUnitPlatform()
            finalizedBy(jacocoTestReport) // 테스트 후 리포트 생성
        }

        jacocoTestReport {
            dependsOn(test)
            reports {
                xml.required.set(true)
                html.required.set(true)
            }
        }
    }
}

tasks.withType<BootJar> {
    enabled = false
}

tasks.withType<Test> {
    useJUnitPlatform()
}
