package com.lotto.manager.h2

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class H2Application

fun main(args: Array<String>) {
    runApplication<H2Application>(*args)
}
