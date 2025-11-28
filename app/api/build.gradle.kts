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
    implementation(project(":domain"))
    implementation(project(":infra:web-adapter"))
    api(project(":infra:rdb"))
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("com.google.firebase:firebase-admin:9.2.0")
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