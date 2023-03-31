plugins {
    kotlin("plugin.jpa") version Versions.kotlin
}
dependencies {
    api(Libraries.Spring.bootStarterDataJpa)
    implementation(project(Modules.domain))
    runtimeOnly(Libraries.Persistence.h2)
}
