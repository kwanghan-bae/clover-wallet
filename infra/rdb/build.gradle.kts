apply(plugin = "org.jetbrains.kotlin.plugin.jpa")

dependencies {
    api("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("io.projectreactor:reactor-core:3.6.5")
    implementation(project(":domain"))
    runtimeOnly("com.h2database:h2:${rootProject.extra["h2Version"] as String}")
    runtimeOnly("org.postgresql:postgresql:${rootProject.extra["postgresqlVersion"] as String}")
}