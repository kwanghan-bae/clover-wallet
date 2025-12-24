package com.wallet.clover.api.service

import com.wallet.clover.api.domain.extraction.ExtractionMethod
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
        
        // 추출 방식별 뱃지
        const val BADGE_DREAM_MASTER = "DREAM_MASTER"
        const val BADGE_SAJU_EXPERT = "SAJU_EXPERT"
        const val BADGE_STATS_GENIUS = "STATS_GENIUS"
        const val BADGE_HOROSCOPE_BELIEVER = "HOROSCOPE_BELIEVER"
        const val BADGE_NATURE_LOVER = "NATURE_LOVER"
    }

    /**
     * 사용자의 당첨 이력을 분석하여 뱃지를 자동으로 부여합니다.
     * DB 카운트 쿼리를 활용하여 성능을 최적화하였습니다.
     */
    suspend fun updateUserBadges(userId: Long) {
        val user = userRepository.findById(userId) ?: return
        val currentBadges = user.badges?.split(",")?.filter { it.isNotBlank() }?.toMutableSet() ?: mutableSetOf()
        val originalBadgeCount = currentBadges.size

        // DB 레벨에서 조건 확인
        val totalGames = lottoGameRepository.countByUserId(userId)
        val winningGamesCount = lottoGameRepository.countWinningGamesByUserId(userId)
        
        // 뱃지 조건 확인 및 부여
        if (winningGamesCount > 0 && !currentBadges.contains(BADGE_FIRST_WIN)) {
            currentBadges.add(BADGE_FIRST_WIN)
        }

        if (!currentBadges.contains(BADGE_LUCKY_1ST) && lottoGameRepository.existsByUserIdAndStatus(userId, LottoGameStatus.WINNING_1.name)) {
            currentBadges.add(BADGE_LUCKY_1ST)
        }

        if (totalGames >= 10 && !currentBadges.contains(BADGE_FREQUENT_PLAYER)) {
            currentBadges.add(BADGE_FREQUENT_PLAYER)
        }

        if (totalGames >= 50 && !currentBadges.contains(BADGE_VETERAN)) {
            currentBadges.add(BADGE_VETERAN)
        }

        // 추출 방식별 뱃지 (특정 방식으로 당첨 시)
        checkAndAddExtractionBadge(userId, ExtractionMethod.DREAM, BADGE_DREAM_MASTER, currentBadges)
        checkAndAddExtractionBadge(userId, ExtractionMethod.SAJU, BADGE_SAJU_EXPERT, currentBadges)
        checkAndAddExtractionBadge(userId, ExtractionMethod.HOROSCOPE, BADGE_HOROSCOPE_BELIEVER, currentBadges)
        checkAndAddExtractionBadge(userId, ExtractionMethod.NATURE_PATTERNS, BADGE_NATURE_LOVER, currentBadges)
        
        // 통계는 HOT/COLD 둘 다 체크
        if (!currentBadges.contains(BADGE_STATS_GENIUS)) {
            if (lottoGameRepository.existsByUserIdAndExtractionMethodAndWinning(userId, ExtractionMethod.STATISTICS_HOT.name) ||
                lottoGameRepository.existsByUserIdAndExtractionMethodAndWinning(userId, ExtractionMethod.STATISTICS_COLD.name)) {
                currentBadges.add(BADGE_STATS_GENIUS)
            }
        }

        // 뱃지 업데이트 (변경된 경우에만 저장)
        if (currentBadges.size != originalBadgeCount) {
            val updatedUser = user.copy(badges = currentBadges.joinToString(","))
            userRepository.save(updatedUser)
        }
    }

    private suspend fun checkAndAddExtractionBadge(
        userId: Long, 
        method: ExtractionMethod, 
        badgeName: String, 
        currentBadges: MutableSet<String>
    ) {
        if (!currentBadges.contains(badgeName) && 
            lottoGameRepository.existsByUserIdAndExtractionMethodAndWinning(userId, method.name)) {
            currentBadges.add(badgeName)
        }
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
                BADGE_DREAM_MASTER -> "🌙 꿈 해몽 마스터"
                BADGE_SAJU_EXPERT -> "📅 사주팔자 전문가"
                BADGE_STATS_GENIUS -> "📊 통계의 신"
                BADGE_HOROSCOPE_BELIEVER -> "⭐ 별자리 신봉자"
                BADGE_NATURE_LOVER -> "🌿 자연의 아이"
                else -> null
            }
        }
    }
}
