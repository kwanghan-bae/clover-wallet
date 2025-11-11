plugins {
    kotlin("native.cocoapods")
    id("com.android.library") // Required for some multiplatform setups, even if not directly building an Android app here
    id("org.jetbrains.compose")
}

kotlin {
    iosX64()
    iosArm64()
    iosSimulatorArm64()

    cocoapods {
        summary = "Some description for the Shared Module"
        homepage = "Link to the Shared Module homepage"
        version = "1.0"
        ios.deploymentTarget = "14.1"
        framework {
            baseName = "shared"
            isStatic = true
        }
    }

    sourceSets {
        val commonMain by getting
        val iosMain by getting {
            dependencies {
                implementation(project(":shared"))
            }
        }
    }
}
