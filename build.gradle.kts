import org.springframework.boot.gradle.tasks.bundling.BootJar

plugins {
    id("org.springframework.boot") version Versions.Spring.boot
    id("io.spring.dependency-management") version Versions.Spring.dependencyManagementPlugin
    id("org.springdoc.openapi-gradle-plugin") version Versions.Spring.docOpenApiUiPlugin
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
    apply(plugin = "org.jlleitschuh.gradle.ktlint")

    group = "com.clover.wallet"

    configurations {
        java.sourceCompatibility = JavaVersion.VERSION_17
        java.targetCompatibility = JavaVersion.VERSION_17
    }
    repositories {
        mavenCentral()
    }

    dependencies {
        implementation(Libraries.Spring.bootStarterValidation)
        testImplementation(Libraries.Spring.bootStarterTest)
        testImplementation(Libraries.Test.kotestRunnerJunit5)
        testImplementation(Libraries.Test.kotestAssertitionsCore)
        testImplementation(Libraries.Test.kotestExtensionsSpring)
        testImplementation(Libraries.Test.mockk)
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

tasks.withType<BootJar> {
    enabled = false
}

tasks.withType<Test> {
    useJUnitPlatform()
}
