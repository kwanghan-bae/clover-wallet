package com.wallet.clover.api.controller

import com.wallet.clover.api.common.CommonResponse
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.DayOfWeek
import java.time.LocalDateTime
import java.time.temporal.TemporalAdjusters

@RestController
@RequestMapping("/api/v1/lotto-info")
class LottoInfoController {

    @GetMapping("/next-draw")
    fun getNextDrawInfo(): CommonResponse<Map<String, Any>> {
        val now = LocalDateTime.now()
        
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
        
        val info = mapOf(
            "currentRound" to currentRound,
            "nextDrawDate" to nextSaturday.toString(),
            "daysLeft" to daysLeft,
            "hoursLeft" to hoursLeft,
            "minutesLeft" to minutesLeft,
            "estimatedJackpot" to 30_000_000_000L  // 예상 금액 (실제론 크롤링 필요)
        )
        
        return CommonResponse.success(info)
    }
}
