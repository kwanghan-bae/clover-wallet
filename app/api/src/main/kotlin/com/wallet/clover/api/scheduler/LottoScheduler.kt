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
    suspend fun scheduleLottoTasks() {
        val today = LocalDate.now()
        val round = calculateRound(today)
        
        logger.info("$round 회차 정기 작업 시작")
        
        try {
            // 1. 당첨 번호 크롤링
            winningInfoCrawler.crawlWinningInfo(round)
            
            // 2. 당첨 판매점 크롤링
            winningStoreCrawler.crawlWinningStores(round)
            
            // 3. 캐시 초기화 (최신 당첨 번호 반영)
            winningNumberProvider.evictLatestWinningNumbersCache()
            
            // 4. 사용자 당첨 확인
            winningCheckService.checkWinning(round)
            
            logger.info("$round 회차 정기 작업 완료")
        } catch (e: Exception) {
            logger.error("$round 회차 정기 작업 실패", e)
        }
    }

    private fun calculateRound(date: LocalDate): Int {
        val weeks = ChronoUnit.WEEKS.between(FIRST_DRAW_DATE, date)
        return (weeks + 1).toInt()
    }

    companion object {
        // 1회차: 2002-12-07
        private val FIRST_DRAW_DATE = LocalDate.of(2002, 12, 7)
    }
}
