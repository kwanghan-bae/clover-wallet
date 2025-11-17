dependencyManagement {
    imports {
        mavenBom(Libraries.Spring.cloud)
    }
}

springBoot {
    mainClass.set("com.wallet.clover.api.CloverApiApplicationKt")
}

dependencies {
    implementation(Libraries.Spring.bootStarter)
    implementation(Libraries.Spring.bootStarterWebflux)
    implementation(Libraries.Kotlin.reflect)
    implementation(Libraries.Kotlin.coroutinesReactor)
    implementation(Libraries.Web.jsoup)
    implementation(project(Modules.domain))
    implementation(project(Modules.Infra.webAdapter))
    api(project(Modules.Infra.rdb))
    implementation(Libraries.Kotlin.jackson)
    implementation("com.google.firebase:firebase-admin:9.2.0")
}
