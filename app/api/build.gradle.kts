dependencyManagement {
    imports {
        mavenBom(Libraries.Spring.cloud)
    }
}

dependencies {
    implementation(Libraries.Spring.bootStarter)
    implementation(Libraries.Spring.bootStarterWeb)
    implementation(Libraries.Kotlin.reflect)
    implementation(Libraries.Web.jsoup)
    implementation(project(Modules.domain))
    implementation(project(Modules.Infra.webAdapter))
    implementation(project(Modules.Infra.rdb))
    implementation(Libraries.Kotlin.jackson)
}
