package com.wallet.clover.api.application

import com.wallet.clover.adapter.LottoHistoryMapper
import com.wallet.clover.adapter.LottoHistoryWebClient
import com.wallet.clover.domain.lotto.LottoHistory
import kotlinx.coroutines.flow.asFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.reactor.awaitSingle
import org.springframework.stereotype.Service
import java.util.concurrent.atomic.LongAdder

@Service
class StatisticsCalculator(
    private val client: LottoHistoryWebClient,
    private val mapper: LottoHistoryMapper,
) {
    suspend fun calculate(): Statistics {
        val games = (1..1065).asFlow()
            .map { client.getByGameNumber(it).awaitSingle() }
            .map { mapper.toDomain(it) }
            .filterNotNull()
            .toList()

        val dateCounter = mutableMapOf<Int, MutableMap<Int, LongAdder>>()
        val monthCounter = mutableMapOf<Int, MutableMap<Int, LongAdder>>()
        val oddEvenCounter = mutableMapOf<String, MutableMap<Int, LongAdder>>()

        games.forEach { game ->
            game.getNumbers().forEach { number ->
                dateCounter.getOrPut(game.drawDate.dayOfMonth) { mutableMapOf() }
                    .computeIfAbsent(number) { LongAdder() }.increment()
                monthCounter.getOrPut(game.drawDate.monthValue) { mutableMapOf() }
                    .computeIfAbsent(number) { LongAdder() }.increment()
                val oddEvenKey = if (game.gameNumber % 2 == 0) "even" else "odd"
                oddEvenCounter.getOrPut(oddEvenKey) { mutableMapOf() }
                    .computeIfAbsent(number) { LongAdder() }.increment()
            }
        }
        return Statistics(dateCounter, monthCounter, oddEvenCounter)
    }

    private fun LottoHistory.getNumbers() = listOf(
        number1,
        number2,
        number3,
        number4,
        number5,
        number6,
        bonusNumber,
    )
}

data class Statistics(
    val dateCounter: Map<Int, Map<Int, LongAdder>>,
    val monthCounter: Map<Int, Map<Int, LongAdder>>,
    val oddEvenCounter: Map<String, Map<Int, LongAdder>>,
)
