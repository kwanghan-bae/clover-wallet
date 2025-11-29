package com.wallet.clover.api.service

import com.wallet.clover.api.entity.game.LottoGameStatus
import com.wallet.clover.api.repository.game.LottoGameRepository
import com.wallet.clover.api.repository.user.UserRepository
import kotlinx.coroutines.flow.toList
import org.springframework.stereotype.Service

@Service
class BadgeService(
    private val userRepository: UserRepository,
    private val lottoGameRepository: LottoGameRepository
) {

    companion object {
        const val BADGE_FIRST_WIN = "FIRST_WIN"
        const val BADGE_LUCKY_1ST = "LUCKY_1ST"
        const val BADGE_FREQUENT_PLAYER = "FREQUENT_PLAYER"
        const val BADGE_VETERAN = "VETERAN"
    }

    /**
     * 사용자의 당첨 이력을 분석하여 뱃지를 자동으로 부여합니다.
     */
    suspend fun updateUserBadges(userId: Long) {
        val user = userRepository.findById(userId) ?: return
        val currentBadges = user.badges?.split(",")?.filter { it.isNotBlank() }?.toMutableSet() ?: mutableSetOf()

        // 모든 게임 조회
        val allGames = lottoGameRepository.findByUserId(userId).toList()
        
        // 당첨된 게임 조회
        val winningGames = allGames.filter { 
            it.status != LottoGameStatus.LOSING
        }

        // 뱃지 조건 확인 및 부여
        if (winningGames.isNotEmpty() && !currentBadges.contains(BADGE_FIRST_WIN)) {
            currentBadges.add(BADGE_FIRST_WIN)
        }

        if (winningGames.any { it.status == LottoGameStatus.WINNING_1 } && !currentBadges.contains(BADGE_LUCKY_1ST)) {
            currentBadges.add(BADGE_LUCKY_1ST)
        }

        if (allGames.size >= 10 && !currentBadges.contains(BADGE_FREQUENT_PLAYER)) {
            currentBadges.add(BADGE_FREQUENT_PLAYER)
        }

        if (allGames.size >= 50 && !currentBadges.contains(BADGE_VETERAN)) {
            currentBadges.add(BADGE_VETERAN)
        }

        // 뱃지 업데이트
        val updatedUser = user.copy(badges = currentBadges.joinToString(","))
        userRepository.save(updatedUser)
    }

    /**
     * 뱃지 목록을 사람이 읽을 수 있는 형태로 변환합니다.
     */
    fun getBadgeDisplayNames(badges: List<String>): List<String> {
        return badges.mapNotNull { badge ->
            when (badge) {
                BADGE_FIRST_WIN -> "첫 당첨"
                BADGE_LUCKY_1ST -> "1등 당첨"
                BADGE_FREQUENT_PLAYER -> "열정적인 플레이어"
                BADGE_VETERAN -> "베테랑"
                else -> null
            }
        }
    }
}
