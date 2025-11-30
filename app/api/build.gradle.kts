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
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-cache")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("net.logstash.logback:logstash-logback-encoder:7.4")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation(
        "org.jetbrains.kotlinx:kotlinx-coroutines-reactor:${rootProject.extra["kotlinCoroutinesVersion"] as String}",
    )
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-slf4j:${rootProject.extra["kotlinCoroutinesVersion"] as String}")
    implementation(
        "org.jsoup:jsoup:${rootProject.extra["jsoupVersion"] as String}",
    )
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("com.google.firebase:firebase-admin:9.2.0")
    
    // Database - R2DBC for reactive
    implementation("org.springframework.boot:spring-boot-starter-data-r2dbc")
    runtimeOnly("org.postgresql:r2dbc-postgresql")
    runtimeOnly("io.r2dbc:r2dbc-h2")
    
    // Security
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
    
    // Documentation
    implementation("org.springdoc:springdoc-openapi-starter-webflux-ui:2.2.0")

    // Rate Limiting
    implementation("com.github.ben-manes.caffeine:caffeine")
    implementation("com.bucket4j:bucket4j-core:8.10.1")
    
    // Reactive (already included with webflux)

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("io.projectreactor:reactor-test")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:${rootProject.extra["kotlinCoroutinesVersion"] as String}")
    testImplementation("com.tngtech.archunit:archunit-junit5:1.2.1")
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