package com.wallet.clover.api.service

import com.wallet.clover.api.client.LottoHistoryMapper
import com.wallet.clover.api.client.LottoHistoryWebClient
import com.wallet.clover.api.domain.lotto.LottoHistory
import com.wallet.clover.api.domain.statistics.Statistics
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class StatisticsCalculator(
    private val client: LottoHistoryWebClient,
    private val mapper: LottoHistoryMapper,
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    suspend fun calculate(): Statistics = coroutineScope {
        logger.info("Fetching and processing games...")
        
        val games = (1..1065).chunked(50).map { batch ->
            batch.map { gameNumber ->
                async {
                    try {
                        client.getByGameNumber(gameNumber)
                    } catch (e: Exception) {
                        logger.error("Failed to fetch game $gameNumber", e)
                        null
                    }
                }
            }.awaitAll()
        }.flatten().mapNotNull { it?.let { response -> mapper.toDomain(response) } }

        logger.info("Finished fetching and processing ${games.size} games.")

        val dateCounter = mutableMapOf<Int, MutableMap<Int, Long>>()
        val monthCounter = mutableMapOf<Int, MutableMap<Int, Long>>()
        val oddEvenCounter = mutableMapOf<String, MutableMap<Int, Long>>()

        games.forEach { game ->
            game.getNumbers().forEach { number ->
                dateCounter.getOrPut(game.drawDate.dayOfMonth) { mutableMapOf() }
                    .compute(number) { _, v -> (v ?: 0L) + 1L }
                monthCounter.getOrPut(game.drawDate.monthValue) { mutableMapOf() }
                    .compute(number) { _, v -> (v ?: 0L) + 1L }
                val oddEvenKey = if (game.gameNumber % 2 == 0) "even" else "odd"
                oddEvenCounter.getOrPut(oddEvenKey) { mutableMapOf() }
                    .compute(number) { _, v -> (v ?: 0L) + 1L }
            }
        }
        logger.info("Finished calculating statistics.")
        Statistics(dateCounter, monthCounter, oddEvenCounter)
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
