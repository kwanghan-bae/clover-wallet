object Libraries {
    object Spring {
        const val bootStarter = "org.springframework.boot:spring-boot-starter"
        const val bootStarterTest = "org.springframework.boot:spring-boot-starter-test"
        const val bootStarterWeb = "org.springframework.boot:spring-boot-starter-web"
        const val openfeign = "org.springframework.cloud:spring-cloud-starter-openfeign"
        const val bootStarterSwagger = "org.springdoc:springdoc-openapi-ui:${Versions.Spring.docOpenApiUi}"
        // implementation("")
        val cloud by lazy { "org.springframework.cloud:spring-cloud-dependencies:${Versions.Spring.cloudDependencyManagement}" } 
    }

    object Kotlin {
        const val jackson = "com.fasterxml.jackson.module:jackson-module-kotlin"
        const val reflect = "org.jetbrains.kotlin:kotlin-reflect"
    }
    
    object Test {
        const val kotestRunnerJunit5 = "io.kotest:kotest-runner-junit5:${Versions.Test.kotest}"
        const val kotestAssertitionsCore = "io.kotest:kotest-assertions-core:${Versions.Test.kotest}"
        const val kotestExtensionsSpring = "io.kotest.extensions:kotest-extensions-spring:${Versions.Test.kotestSpringExtension}"
        const val mockk = "io.mockk:mockk:${Versions.Test.mockk}"
    }
}
