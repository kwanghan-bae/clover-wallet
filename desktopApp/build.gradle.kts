import org.jetbrains.compose.desktop.application.dsl.TargetFormat
import Versions // Versions 객체 import

plugins {
    kotlin("multiplatform")
    id("org.jetbrains.compose") version Versions.Compose.multiplatform // 버전 명시
}

kotlin {
    jvm()
    sourceSets {
        val jvmMain by getting {
            dependencies {
                implementation(compose.desktop.currentOs)
            }
        }
        val jvmTest by getting
    }
}

compose.desktop {
    application {
        mainClass = "MainKt"

        nativeDistributions {
            targetFormats(
                TargetFormat.DEB,
                TargetFormat.RPM,
                TargetFormat.DMG,
                TargetFormat.EXE,
                TargetFormat.MSI
            )
        }
    }
}
