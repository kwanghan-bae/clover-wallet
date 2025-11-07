dependencyManagement {
    imports {
        mavenBom(Libraries.Spring.cloud)
    }
}

dependencies {
    implementation(Libraries.Spring.bootStarterWebflux)
    implementation(Libraries.Kotlin.coroutinesReactor)
    api(project(Modules.domain))
    implementation(Libraries.Web.jsoup)
    implementation(Libraries.Kotlin.jackson)
}
