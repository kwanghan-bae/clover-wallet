package com.wallet.clover.api.service

import com.wallet.clover.api.repository.winning.WinningInfoRepository
import org.springframework.stereotype.Service
import java.time.Clock
import java.time.DayOfWeek
import java.time.LocalDateTime
import java.time.temporal.TemporalAdjusters

@Service
class LottoInfoService(
    private val winningInfoRepository: WinningInfoRepository,
    private val clock: Clock = Clock.systemDefaultZone()
) {
    suspend fun getNextDrawInfo(): Map<String, Any> {
        val now = LocalDateTime.now(clock)
        
        // 다음 토요일 20:40 계산
        val nextSaturday = now.with(TemporalAdjusters.next(DayOfWeek.SATURDAY))
            .withHour(20)
            .withMinute(40)
            .withSecond(0)
        
        // 현재 회차 계산 (기준: 2002년 12월 7일 1회차)
        val firstDrawDate = LocalDateTime.of(2002, 12, 7, 20, 40)
        val weeksSinceFirst = java.time.Duration.between(firstDrawDate, now).toDays() / 7
        val currentRound = weeksSinceFirst.toInt() + 1
        
        // 남은 시간 계산
        val duration = java.time.Duration.between(now, nextSaturday)
        val daysLeft = duration.toDays()
        val hoursLeft = duration.toHours() % 24
        val minutesLeft = duration.toMinutes() % 60
        
        // 예상 당첨금 (최근 회차 1등 당첨금 사용)
        val lastWinning = winningInfoRepository.findFirstByOrderByRoundDesc()
        val estimatedJackpot = lastWinning?.firstPrizeAmount ?: 30_000_000_000L
        
        return mapOf(
            "currentRound" to currentRound,
            "nextDrawDate" to nextSaturday.toString(),
            "daysLeft" to daysLeft,
            "hoursLeft" to hoursLeft,
            "minutesLeft" to minutesLeft,
            "estimatedJackpot" to estimatedJackpot
        )
    }

    suspend fun getDrawResult(round: Int): com.wallet.clover.api.entity.winning.WinningInfoEntity? {
        return winningInfoRepository.findByRound(round)
    }
}
