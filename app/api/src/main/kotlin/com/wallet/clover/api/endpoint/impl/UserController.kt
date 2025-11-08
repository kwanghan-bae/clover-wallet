package com.wallet.clover.api.endpoint.impl

import com.wallet.clover.api.application.Statistics
import com.wallet.clover.api.application.StatisticsCalculator
import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/user")
class UserController(
    private val statisticsCalculator: StatisticsCalculator,
) {

    private val logger = LoggerFactory.getLogger(javaClass)

    @GetMapping
    suspend fun setUp() {
        logger.info("Calculating statistics...")
        val statistics = statisticsCalculator.calculate()
        printStatistics(statistics)
        logger.info("Statistics calculation complete.")
    }

    private fun printStatistics(statistics: Statistics) {
        logger.info("[일자별 통계]")
        statistics.dateCounter.forEach { (date, numbers) ->
            logger.info("$date 일")
            numbers.forEach { (number, count) ->
                logger.info("$number : $count 회")
            }
        }
        logger.info("[월별별 통계]")
        statistics.monthCounter.forEach { (month, numbers) ->
            logger.info("$month 월")
            numbers.forEach { (number, count) ->
                logger.info("$number : $count 회")
            }
        }
        logger.info("[홀수 회차별 통계]")
        statistics.oddEvenCounter["odd"]?.forEach { (number, count) ->
            logger.info("$number : ${count.toLong()} 회")
        }
        logger.info("[짝수 회차별 통계]")
        statistics.oddEvenCounter["even"]?.forEach { (number, count) ->
            logger.info("$number : ${count.toLong()} 회")
        }
    }
}
