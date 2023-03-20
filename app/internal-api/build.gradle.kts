dependencyManagement {
    imports {
        mavenBom(Libraries.Spring.cloud)
    }
}

dependencies {
    implementation(Libraries.Spring.bootStarter)
    implementation(Libraries.Spring.bootStarterWeb)
    implementation(Libraries.Kotlin.reflect)
    implementation(project(Modules.domain))
    implementation(project(Modules.Infra.externalWebAdapter))
}
