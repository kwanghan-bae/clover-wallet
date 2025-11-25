apply(plugin = "org.jetbrains.kotlin.plugin.jpa")

dependencies {
    api("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation(project(":domain"))
    runtimeOnly("com.h2database:h2:${rootProject.extra["h2Version"] as String}")
    runtimeOnly("org.postgresql:postgresql:${rootProject.extra["postgresqlVersion"] as String}")
}