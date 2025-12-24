package com.wallet.clover.api.entity.game

import com.wallet.clover.api.domain.extraction.ExtractionMethod
import com.wallet.clover.api.entity.winning.WinningInfoEntity
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("lotto_game")
data class LottoGameEntity(
    /** 게임 고유 ID */
    @Id val id: Long? = null,
    
    /** 소유자 ID */
    val userId: Long,
    
    /** 소속 티켓 ID */
    val ticketId: Long,
    
    /** 게임 상태 (WINNING_1, LOSING 등) */
    val status: LottoGameStatus,
    
    /** 첫 번째 번호 */
    val number1: Int,
    /** 두 번째 번호 */
    val number2: Int,
    /** 세 번째 번호 */
    val number3: Int,
    /** 네 번째 번호 */
    val number4: Int,
    /** 다섯 번째 번호 */
    val number5: Int,
    /** 여섯 번째 번호 */
    val number6: Int,
    
    /** 번호 추출 방식 (DREAM, SAJU 등) */
    val extractionMethod: ExtractionMethod? = null,  // 사용된 추출 방식 (ExtractionMethod enum 값)
    
    /** 당첨금 (0이면 낙첨 또는 미확인) */
    val prizeAmount: Long = 0, // 당첨금 (0이면 낙첨 또는 미확인)
    
    /** 생성 일시 */
    @CreatedDate
    val createdAt: LocalDateTime? = null,
    
    /** 수정 일시 */
    val updatedAt: LocalDateTime = LocalDateTime.now()
) {
    fun getNumbers(): List<Int> {
        return listOf(number1, number2, number3, number4, number5, number6)
    }

    fun calculateRank(winningInfo: WinningInfoEntity): Pair<LottoGameStatus, Long> {
        val myNumbers = getNumbers().toSet()
        val winningNumbers = setOf(winningInfo.number1, winningInfo.number2, winningInfo.number3, winningInfo.number4, winningInfo.number5, winningInfo.number6)
        
        val matchCount = myNumbers.intersect(winningNumbers).size
        val bonusMatch = myNumbers.contains(winningInfo.bonusNumber)
        
        return when (matchCount) {
            6 -> LottoGameStatus.WINNING_1 to winningInfo.firstPrizeAmount
            5 -> if (bonusMatch) LottoGameStatus.WINNING_2 to winningInfo.secondPrizeAmount else LottoGameStatus.WINNING_3 to winningInfo.thirdPrizeAmount
            4 -> LottoGameStatus.WINNING_4 to winningInfo.fourthPrizeAmount
            3 -> LottoGameStatus.WINNING_5 to winningInfo.fifthPrizeAmount
            else -> LottoGameStatus.LOSING to 0L
        }
    }
}
