object Libraries {
    object Spring {
        const val bootStarter = "org.springframework.boot:spring-boot-starter"
        const val bootStarterTest = "org.springframework.boot:spring-boot-starter-test"
        const val bootStarterWeb = "org.springframework.boot:spring-boot-starter-web"
        const val openfeign = "org.springframework.cloud:spring-cloud-starter-openfeign"
        val cloud by lazy { "org.springframework.cloud:spring-cloud-dependencies:${Versions.Spring.cloudDependencyManagement}" } 
    }

    object Kotlin {
        const val jackson = "com.fasterxml.jackson.module:jackson-module-kotlin"
        const val reflect = "org.jetbrains.kotlin:kotlin-reflect"
    }
}