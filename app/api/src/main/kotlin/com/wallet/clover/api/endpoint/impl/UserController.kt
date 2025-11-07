package com.wallet.clover.api.endpoint.impl

import com.wallet.clover.api.application.Statistics
import com.wallet.clover.api.application.StatisticsCalculator
import com.wallet.clover.api.endpoint.UserSpec
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/user")
class UserController(
    private val statisticsCalculator: StatisticsCalculator,
) : UserSpec {

    @GetMapping
    suspend fun setUp() {
        val statistics = statisticsCalculator.calculate()
        printStatistics(statistics)
    }

    private fun printStatistics(statistics: Statistics) {
        println("[일자별 통계]")
        statistics.dateCounter.forEach { dateEntry ->
            println("${dateEntry.key} 일")
            dateEntry.value.forEach { numberEntry ->
                println("$numberEntry : ${numberEntry.value} 회")
            }
        }
        println("[월별별 통계]")
        statistics.monthCounter.forEach { monthEntry ->
            println("${monthEntry.key} 월")
            monthEntry.value.forEach { numberEntry ->
                println("$numberEntry : ${numberEntry.value} 회")
            }
        }
        println("[홀수 회차별 통계]")
        statistics.oddEvenCounter["odd"]?.forEach {
            println("${it.key} : ${it.value.toLong()} 회")
        }
        println("[짝수 회차별 통계]")
        statistics.oddEvenCounter["even"]?.forEach {
            println("${it.key} : ${it.value.toLong()} 회")
        }
    }
}
