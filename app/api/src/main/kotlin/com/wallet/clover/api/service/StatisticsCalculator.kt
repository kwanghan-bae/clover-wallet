package com.wallet.clover.api.service

import com.wallet.clover.api.client.LottoHistoryMapper
import com.wallet.clover.api.client.LottoHistoryWebClient
import com.wallet.clover.api.domain.lotto.LottoHistory
import com.wallet.clover.api.domain.statistics.Statistics
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.withContext
import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service

import kotlinx.coroutines.slf4j.MDCContext

@Service
class StatisticsCalculator(
    private val client: LottoHistoryWebClient,
    private val mapper: LottoHistoryMapper,
    private val dispatcher: CoroutineDispatcher = Dispatchers.Default
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    @Cacheable("lotto-statistics")
    suspend fun calculate(maxGameNumber: Int): Statistics = coroutineScope {
        logger.info("$maxGameNumber 회차까지 게임 데이터 조회 및 처리 중...")
        
        val games = withContext(dispatcher + MDCContext()) {
            (1..maxGameNumber).chunked(50).map { batch ->
                batch.map { gameNumber ->
                    async(MDCContext()) {
                        try {
                            client.getByGameNumber(gameNumber)
                        } catch (e: Exception) {
                            logger.error("$gameNumber 회차 게임 조회 실패", e)
                            null
                        }
                    }
                }.awaitAll()
            }.flatten().mapNotNull { it?.let { response -> mapper.toDomain(response) } }
        }

        logger.info("${games.size}개 게임 데이터 조회 및 처리 완료.")

        val numberFrequency = mutableMapOf<Int, Long>()
        val dateCounter = mutableMapOf<Int, MutableMap<Int, Long>>()
        val monthCounter = mutableMapOf<Int, MutableMap<Int, Long>>()
        val oddEvenCounter = mutableMapOf<String, MutableMap<Int, Long>>()

        games.forEach { game ->
            game.getNumbers().forEach { number ->
                numberFrequency.compute(number) { _, v -> (v ?: 0L) + 1L }
                dateCounter.getOrPut(game.drawDate.dayOfMonth) { mutableMapOf() }
                    .compute(number) { _, v -> (v ?: 0L) + 1L }
                monthCounter.getOrPut(game.drawDate.monthValue) { mutableMapOf() }
                    .compute(number) { _, v -> (v ?: 0L) + 1L }
                val oddEvenKey = if (game.gameNumber % 2 == 0) "even" else "odd"
                oddEvenCounter.getOrPut(oddEvenKey) { mutableMapOf() }
                    .compute(number) { _, v -> (v ?: 0L) + 1L }
            }
        }
        logger.info("통계 계산 완료.")
        Statistics(dateCounter, monthCounter, oddEvenCounter, numberFrequency)
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
