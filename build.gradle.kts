plugins {
    id("org.springframework.boot") version Versions.Spring.boot
    id("io.spring.dependency-management") version Versions.Spring.dependencyManagement
    id("org.jlleitschuh.gradle.ktlint") version Versions.ktlint
    kotlin("jvm") version Versions.kotlin
    kotlin("plugin.spring") version Versions.kotlin
}

repositories {
    mavenCentral()
}

subprojects {
    apply(plugin = "org.springframework.boot")
    apply(plugin = "io.spring.dependency-management")
    apply(plugin = "org.jetbrains.kotlin.jvm")
    apply(plugin = "org.jetbrains.kotlin.plugin.spring")

    group = "com.lotto.private-manager"

    configurations {
        java.sourceCompatibility = JavaVersion.VERSION_17
        java.targetCompatibility = JavaVersion.VERSION_17
    }
    repositories {
        mavenCentral()
    }

    dependencies {
        testImplementation(Libraries.Spring.bootStarterTest)
        testImplementation("io.kotest:kotest-runner-junit5:${Versions.Test.kotest}")
        testImplementation("io.kotest:kotest-assertions-core:${Versions.Test.kotest}")
        testImplementation("io.kotest.extensions:kotest-extensions-spring:${Versions.Test.kotestSpringExtension}")
        testImplementation("io.mockk:mockk:${Versions.Test.mockk}")
    }

    val bootJar = tasks.bootJar.get()
    val jar = tasks.jar.get()

    if (project.path.startsWith(":app:")) {
        println("bootJar enable : ${project.path}")
        bootJar.enabled = true
        jar.enabled = false
    } else {
        println("bootJar disable : ${project.path}")
        bootJar.enabled = false
        jar.enabled = true
    }
    tasks {
        compileKotlin {
            kotlinOptions {
                freeCompilerArgs = listOf("-Xjsr305=strict")
                jvmTarget = "17"
            }
            dependsOn(processResources) // kotlin 에서 ConfigurationProperties
        }

        compileTestKotlin {
            kotlinOptions {
                freeCompilerArgs = listOf("-Xjsr305=strict")
                jvmTarget = "17"
            }
            dependsOn(processResources) // kotlin 에서 ConfigurationProperties
        }
        test {
            useJUnitPlatform()
        }
    }
}

tasks {
    bootJar {
        enabled = false
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}
