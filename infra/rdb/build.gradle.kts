dependencies {
    api(Libraries.Spring.bootDataJpa)
    implementation(project(Modules.domain))
    implementation(Libraries.Persistence.h2)
}
