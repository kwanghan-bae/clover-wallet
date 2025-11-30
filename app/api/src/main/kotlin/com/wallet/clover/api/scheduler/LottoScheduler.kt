package com.wallet.clover.api.scheduler

import com.wallet.clover.api.service.LottoWinningStoreCrawler
import com.wallet.clover.api.service.WinningCheckService
import com.wallet.clover.api.service.WinningInfoCrawler
import com.wallet.clover.api.service.WinningNumberProvider
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.time.temporal.ChronoUnit

@Component
class LottoScheduler(
    private val winningInfoCrawler: WinningInfoCrawler,
    private val winningStoreCrawler: LottoWinningStoreCrawler,
    private val winningCheckService: WinningCheckService,
    private val winningNumberProvider: WinningNumberProvider
) {
    private val logger = LoggerFactory.getLogger(LottoScheduler::class.java)

    // 매주 토요일 오후 9시 30분에 실행 (추첨 방송 종료 후)
    @Scheduled(cron = "0 30 21 * * SAT")
    fun scheduleLottoTasks() {
        val today = LocalDate.now()
        val round = calculateRound(today)
        
        logger.info("Starting scheduled tasks for round $round")
        
        runBlocking {
            try {
                // 1. 당첨 번호 크롤링
                winningInfoCrawler.crawlWinningInfo(round)
                
                // 2. 당첨 판매점 크롤링
                winningStoreCrawler.crawlWinningStores(round)
                
                // 3. 캐시 초기화 (최신 당첨 번호 반영)
                winningNumberProvider.evictLatestWinningNumbersCache()
                
                // 4. 사용자 당첨 확인
                winningCheckService.checkWinning(round)
                
                logger.info("Scheduled tasks completed successfully for round $round")
            } catch (e: Exception) {
                logger.error("Scheduled tasks failed for round $round", e)
            }
        }
    }

    private fun calculateRound(date: LocalDate): Int {
        // 1회차: 2002-12-07
        val firstDrawDate = LocalDate.of(2002, 12, 7)
        val weeks = ChronoUnit.WEEKS.between(firstDrawDate, date)
        return (weeks + 1).toInt()
    }
}
