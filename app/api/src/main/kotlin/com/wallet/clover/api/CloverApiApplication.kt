package com.wallet.clover.api

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication(scanBasePackages = ["com.wallet.clover"])
@org.springframework.boot.context.properties.ConfigurationPropertiesScan
class CloverApiApplication

fun main(args: Array<String>) {
    runApplication<CloverApiApplication>(*args)
}
