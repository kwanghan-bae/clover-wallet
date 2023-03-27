dependencyManagement {
    imports {
        mavenBom(Libraries.Spring.cloud)
    }
}

dependencies {
    implementation(project(Modules.domain))
    api(Libraries.Spring.openfeign)
    api(Libraries.Web.jsoup)
    implementation(Libraries.Spring.bootStarterWeb)
    implementation(Libraries.Kotlin.jackson)
}
