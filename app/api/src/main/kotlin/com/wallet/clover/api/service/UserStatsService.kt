package com.wallet.clover.api.service

import com.wallet.clover.api.dto.UserStatsResponse
import com.wallet.clover.api.entity.game.LottoGameStatus
import com.wallet.clover.api.repository.game.LottoGameRepository
import kotlinx.coroutines.flow.toList
import org.springframework.stereotype.Service

@Service
class UserStatsService(
    private val lottoGameRepository: LottoGameRepository
) {

    suspend fun getUserStats(userId: Long): UserStatsResponse {
        val allGames = lottoGameRepository.findByUserId(userId).toList()
        
        // 총 당첨금 계산 (간이 계산, 실제로는 상금 테이블 필요)
        val totalWinnings = allGames.sumOf { game ->
            when (game.status) {
                LottoGameStatus.WINNING_1 -> 2_000_000_000L // 1등 20억 (예시)
                LottoGameStatus.WINNING_2 -> 50_000_000L   // 2등 5천만원
                LottoGameStatus.WINNING_3 -> 1_500_000L     // 3등 150만원
                LottoGameStatus.WINNING_4 -> 50_000L        // 4등 5만원
                LottoGameStatus.WINNING_5 -> 5_000L         // 5등 5천원
                else -> 0L
            }
        }
        
        // 총 지출 (1게임 = 1000원)
        val totalSpent = allGames.size * 1000L
        
        // 수익률 계산
        val roi = if (totalSpent > 0) {
            ((totalWinnings - totalSpent).toDouble() / totalSpent * 100).toInt()
        } else {
            0
        }
        
        return UserStatsResponse(
            totalGames = allGames.size,
            totalWinnings = totalWinnings,
            totalSpent = totalSpent,
            roi = roi
        )
    }
}
