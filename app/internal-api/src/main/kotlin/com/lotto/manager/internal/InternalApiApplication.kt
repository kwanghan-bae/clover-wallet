package com.lotto.manager.internal

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cloud.openfeign.EnableFeignClients

@SpringBootApplication(scanBasePackages = ["com.lotto.manager"])
@EnableFeignClients(basePackages = ["com.lotto.manager"])
class InternalApiApplication

fun main(args: Array<String>) {
    // asdfasdf
    
    val a = ""
    var b = 1
    runApplication<InternalApiApplication>(*args)
}
