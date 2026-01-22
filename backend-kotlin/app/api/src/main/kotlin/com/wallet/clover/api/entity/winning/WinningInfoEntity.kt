package com.wallet.clover.api.entity.winning

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDate

@Table("winning_info")
data class WinningInfoEntity(
    /** 당첨 정보 ID */
    @Id
    val id: Long? = null,
    
    /** 회차 */
    val round: Int,
    
    /** 추첨일 */
    val drawDate: LocalDate,
    
    /** 당첨 번호 1 */
    val number1: Int,
    /** 당첨 번호 2 */
    val number2: Int,
    /** 당첨 번호 3 */
    val number3: Int,
    /** 당첨 번호 4 */
    val number4: Int,
    /** 당첨 번호 5 */
    val number5: Int,
    /** 당첨 번호 6 */
    val number6: Int,
    /** 보너스 번호 */
    val bonusNumber: Int,
    
    /** 1등 당첨금 (1게임당) */
    val firstPrizeAmount: Long,
    /** 2등 당첨금 */
    val secondPrizeAmount: Long,
    /** 3등 당첨금 */
    val thirdPrizeAmount: Long,
    /** 4등 당첨금 (보통 50,000) */
    val fourthPrizeAmount: Long,
    /** 5등 당첨금 (보통 5,000) */
    val fifthPrizeAmount: Long
)
