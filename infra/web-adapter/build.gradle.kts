dependencyManagement {
    imports {
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:${rootProject.extra["springCloudDependencyManagementVersion"] as String}")
    }
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-webflux")
    implementation(
        "org.jetbrains.kotlinx:kotlinx-coroutines-reactor:${rootProject.extra["kotlinCoroutinesVersion"] as String}",
    )
    api(project(":domain"))
    implementation(
        "org.jsoup:jsoup:${rootProject.extra["jsoupVersion"] as String}",
    )
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
}