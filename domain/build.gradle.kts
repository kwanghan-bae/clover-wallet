dependencies {
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.springframework:spring-tx:6.1.6") // or use BOM version
    implementation("io.projectreactor:reactor-core:3.6.5")
    implementation("org.springframework:spring-context:6.1.6")
    implementation("jakarta.annotation:jakarta.annotation-api") // for common annotations if needed
}
