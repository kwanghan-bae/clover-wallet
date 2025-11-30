package com.wallet.clover.api.entity.game

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
    val extractionMethod: String? = null,  // 사용된 추출 방식 (ExtractionMethod enum 값)
    
    /** 당첨금 (0이면 낙첨 또는 미확인) */
    val prizeAmount: Long = 0, // 당첨금 (0이면 낙첨 또는 미확인)
    
    /** 생성 일시 */
    @CreatedDate
    val createdAt: LocalDateTime? = null,
    
    /** 수정 일시 */
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
