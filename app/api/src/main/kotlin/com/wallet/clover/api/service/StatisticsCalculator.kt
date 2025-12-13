package com.wallet.clover.api.service

import com.wallet.clover.api.domain.statistics.Statistics
import com.wallet.clover.api.entity.winning.WinningInfoEntity
import com.wallet.clover.api.repository.winning.WinningInfoRepository
import kotlinx.coroutines.flow.toList
import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service

/**
 * 로또 통계를 계산하는 서비스.
 * DB에 저장된 WinningInfo를 기반으로 통계를 산출합니다.
 */
@Service
class StatisticsCalculator(
    private val winningInfoRepository: WinningInfoRepository
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    /**
     * 지정된 회차까지의 통계를 계산합니다.
     * DB에서 데이터를 조회하므로 외부 API 호출보다 훨씬 빠릅니다.
     */
    @Cacheable("lotto-statistics")
    suspend fun calculate(maxGameNumber: Int): Statistics {
        logger.info("$maxGameNumber 회차까지 DB에서 당첨 정보 조회 중...")
        
        val winningInfoList = winningInfoRepository.findByRoundLessThanEqual(maxGameNumber).toList()
        
        logger.info("${winningInfoList.size}개 당첨 정보 조회 완료. 통계 계산 시작...")

        val numberFrequency = mutableMapOf<Int, Long>()
        val dateCounter = mutableMapOf<Int, MutableMap<Int, Long>>()
        val monthCounter = mutableMapOf<Int, MutableMap<Int, Long>>()
        val oddEvenCounter = mutableMapOf<String, MutableMap<Int, Long>>()

        winningInfoList.forEach { info ->
            info.getNumbers().forEach { number ->
                numberFrequency.compute(number) { _, v -> (v ?: 0L) + 1L }
                dateCounter.getOrPut(info.drawDate.dayOfMonth) { mutableMapOf() }
                    .compute(number) { _, v -> (v ?: 0L) + 1L }
                monthCounter.getOrPut(info.drawDate.monthValue) { mutableMapOf() }
                    .compute(number) { _, v -> (v ?: 0L) + 1L }
                val oddEvenKey = if (info.round % 2 == 0) "even" else "odd"
                oddEvenCounter.getOrPut(oddEvenKey) { mutableMapOf() }
                    .compute(number) { _, v -> (v ?: 0L) + 1L }
            }
        }
        
        logger.info("통계 계산 완료.")
        return Statistics(dateCounter, monthCounter, oddEvenCounter, numberFrequency)
    }

    private fun WinningInfoEntity.getNumbers() = listOf(
        number1,
        number2,
        number3,
        number4,
        number5,
        number6,
        bonusNumber,
    )
}

