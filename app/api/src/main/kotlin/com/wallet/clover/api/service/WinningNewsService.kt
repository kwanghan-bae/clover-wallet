package com.wallet.clover.api.service

import com.wallet.clover.api.domain.extraction.ExtractionMethod
import com.wallet.clover.api.entity.game.LottoGameStatus
import com.wallet.clover.api.repository.game.LottoGameRepository
import kotlinx.coroutines.flow.toList
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
class WinningNewsService(
    private val lottoGameRepository: LottoGameRepository
) {

    /**
     * 최근 당첨 뉴스를 가져옵니다 (마케팅용)
     * 추출 방식별 당첨 정보를 포함합니다.
     */
    suspend fun getRecentWinningNews(): List<Map<String, Any>> {
        // 최근 7일간의 당첨 게임 조회
        val cutoffDate = LocalDateTime.now().minusDays(7)
        val winningGames = lottoGameRepository.findAll()
            .toList()
            .filter { 
                (it.createdAt?.isAfter(cutoffDate) == true) && 
                it.status != LottoGameStatus.LOSING &&
                it.extractionMethod != null
            }
            .sortedByDescending { it.createdAt }
            .take(10)

        return winningGames.map { game ->
            mapOf(
                "extractionMethod" to (game.extractionMethod ?: "RANDOM"),
                "rank" to getRankFromStatus(game.status),
                "createdAt" to (game.createdAt ?: LocalDateTime.now()).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                "message" to getWinningMessage(game.extractionMethod, game.status)
            )
        }
    }

    private fun getRankFromStatus(status: LottoGameStatus): String {
        return when (status) {
            LottoGameStatus.WINNING_1 -> "1등"
            LottoGameStatus.WINNING_2 -> "2등"
            LottoGameStatus.WINNING_3 -> "3등"
            LottoGameStatus.WINNING_4 -> "4등"
            LottoGameStatus.WINNING_5 -> "5등"
            else -> "당첨"
        }
    }

    private fun getWinningMessage(method: ExtractionMethod?, status: LottoGameStatus): String {
        val rank = getRankFromStatus(status)
        val methodName = when (method) {
            ExtractionMethod.DREAM -> "꿈 해몽"
            ExtractionMethod.SAJU -> "사주팔자"
            ExtractionMethod.STATISTICS_HOT -> "통계 HOT"
            ExtractionMethod.STATISTICS_COLD -> "통계 COLD"
            ExtractionMethod.HOROSCOPE -> "별자리 운세"
            ExtractionMethod.PERSONAL_SIGNIFICANCE -> "의미있는 숫자"
            ExtractionMethod.NATURE_PATTERNS -> "자연의 패턴"
            ExtractionMethod.ANCIENT_DIVINATION -> "고대 점술"
            ExtractionMethod.COLORS_SOUNDS -> "색상 & 소리"
            ExtractionMethod.ANIMAL_OMENS -> "동물 징조"
            else -> "행운"
        }
        
        return "🎉 ${methodName} 방식으로 ${rank} 당첨!"
    }
}
