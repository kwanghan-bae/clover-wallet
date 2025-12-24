package com.wallet.clover.api.service

import com.wallet.clover.api.dto.UserStats
import com.wallet.clover.api.entity.game.LottoGameStatus
import com.wallet.clover.api.repository.game.LottoGameRepository
import kotlinx.coroutines.flow.toList
import org.springframework.stereotype.Service

@Service
class UserStatsService(
    private val lottoGameRepository: LottoGameRepository
) {

    suspend fun getUserStats(userId: Long): UserStats.Response {
        val totalGames = lottoGameRepository.countByUserId(userId)
        val totalWinnings = lottoGameRepository.sumPrizeAmountByUserId(userId) ?: 0L
        
        // 총 지출 (1게임 = 1000원)
        val totalSpent = totalGames * 1000L
        
        // 수익률 계산
        val roi = if (totalSpent > 0) {
            ((totalWinnings - totalSpent).toDouble() / totalSpent * 100).toInt()
        } else {
            0
        }
        
        return UserStats.Response(
            totalGames = totalGames.toInt(),
            totalWinnings = totalWinnings,
            totalSpent = totalSpent,
            roi = roi
        )
    }
}
