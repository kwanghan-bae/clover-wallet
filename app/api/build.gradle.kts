dependencyManagement {
    imports {
        mavenBom(
            "org.springframework.cloud:spring-cloud-dependencies:${rootProject.extra["springCloudDependencyManagementVersion"] as String}",
        )
    }
}

springBoot {
    mainClass.set("com.wallet.clover.api.CloverApiApplicationKt")
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter")
    implementation("org.springframework.boot:spring-boot-starter-webflux")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation(
        "org.jetbrains.kotlinx:kotlinx-coroutines-reactor:${rootProject.extra["kotlinCoroutinesVersion"] as String}",
    )
    implementation(
        "org.jsoup:jsoup:${rootProject.extra["jsoupVersion"] as String}",
    )
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("com.google.firebase:firebase-admin:9.2.0")
    
    // Database
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    runtimeOnly("com.h2database:h2:${rootProject.extra["h2Version"] as String}")
    runtimeOnly("org.postgresql:postgresql:${rootProject.extra["postgresqlVersion"] as String}")
    
    // Security
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
    
    // Reactive
    implementation("io.projectreactor:reactor-core:3.6.5")
}

tasks.register("generateDdl", JavaExec::class) {
    group = "JPA"
    description = "Generates the DDL script from the JPA entities."
    classpath = sourceSets["main"].runtimeClasspath
    mainClass.set("com.wallet.clover.api.CloverApiApplicationKt")
    args(
        "--spring.jpa.properties.jakarta.persistence.schema-generation.scripts.action=create",
        "--spring.jpa.properties.jakarta.persistence.schema-generation.scripts.create-target=build/schema.sql",
        "--spring.jpa.hibernate.ddl-auto=create",
        "--spring.datasource.url=jdbc:h2:mem:db;DB_CLOSE_DELAY=-1",
        "--spring.datasource.username=sa",
        "--spring.datasource.password="
    )
}