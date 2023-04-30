package com.wallet.clover.api.endpoint.impl

import com.wallet.clover.adapter.LottoHistoryFeignClient
import com.wallet.clover.api.endpoint.UserSpec
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.concurrent.atomic.LongAdder

@RestController
@RequestMapping("/v1/user")
class UserController(
    private val client: LottoHistoryFeignClient,
) : UserSpec {

    @GetMapping
    fun setUp() {
        val dateCounter = mutableMapOf<Int, MutableMap<Int, LongAdder>>().apply {
            (1..31).forEach {
                put(it, mutableMapOf())
            }
        }

        val monthCounter = mutableMapOf<Int, MutableMap<Int, LongAdder>>().apply {
            (1..12).forEach {
                put(it, mutableMapOf())
            }
        }

        val oddEvenCounter = mutableMapOf<String, MutableMap<Int, LongAdder>>().apply {
            put("odd", mutableMapOf())
            put("even", mutableMapOf())
        }

        (1..1065).forEach {
            val game = client.getByGameNumber(it).toDomain()
            listOf(
                game.number1,
                game.number2,
                game.number3,
                game.number4,
                game.number5,
                game.number6,
                game.bonusNumber,
            ).forEach { number ->
                dateCounter[game.drawDate.dayOfMonth]!!.computeIfAbsent(number) { LongAdder() }.increment()
                monthCounter[game.drawDate.monthValue]!!.computeIfAbsent(number) { LongAdder() }.increment()
                if (game.gameNumber % 2 == 0) {
                    oddEvenCounter["even"]!!.computeIfAbsent(number) { LongAdder() }.increment()
                } else {
                    oddEvenCounter["odd"]!!.computeIfAbsent(number) { LongAdder() }.increment()
                }
            }
        }

        println("[일자별 통계]")
        dateCounter.forEach { dateEntry ->
            println("${dateEntry.key} 일")
            dateEntry.value.forEach { numberEntry ->
                println("$numberEntry : ${numberEntry.value} 회")
            }
        }
        println("[월별별 통계]")
        dateCounter.forEach { monthEntry ->
            println("${monthEntry.key} 월")
            monthEntry.value.forEach { numberEntry ->
                println("$numberEntry : ${numberEntry.value} 회")
            }
        }
        println("[홀수 회차별 통계]")
        oddEvenCounter["odd"]!!.forEach {
            println("${it.key} : ${it.value.toLong()} 회")
        }
        println("[짝수 회차별 통계]")
        oddEvenCounter["even"]!!.forEach {
            println("${it.key} : ${it.value.toLong()} 회")
        }
    }
}
