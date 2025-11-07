dependencyManagement {
    imports {
        mavenBom(Libraries.Spring.cloud)
    }
}

dependencies {
    implementation(Libraries.Spring.bootStarterWebflux)
    api(project(Modules.domain))
    implementation(Libraries.Web.jsoup)
    implementation(Libraries.Spring.bootStarterWeb)
    implementation(Libraries.Kotlin.jackson)
}
