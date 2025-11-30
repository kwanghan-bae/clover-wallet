package com.wallet.clover.api

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling

@EnableScheduling
@SpringBootApplication(scanBasePackages = ["com.wallet.clover"])
@org.springframework.boot.context.properties.ConfigurationPropertiesScan
@org.springframework.cache.annotation.EnableCaching
class CloverApiApplication

fun main(args: Array<String>) {
    runApplication<CloverApiApplication>(*args)
}
