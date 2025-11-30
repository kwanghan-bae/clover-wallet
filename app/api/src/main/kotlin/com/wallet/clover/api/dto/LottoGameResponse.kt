package com.wallet.clover.api.dto

import com.wallet.clover.api.entity.game.LottoGameEntity
import com.wallet.clover.api.entity.game.LottoGameStatus
import java.time.LocalDateTime

data class LottoGameResponse(
    /** 게임 ID */
    val id: Long,
    
    /** 게임 상태 (WINNING_1 등) */
    val status: LottoGameStatus,
    
    /** 번호 1 */
    val number1: Int,
    /** 번호 2 */
    val number2: Int,
    /** 번호 3 */
    val number3: Int,
    /** 번호 4 */
    val number4: Int,
    /** 번호 5 */
    val number5: Int,
    /** 번호 6 */
    val number6: Int,
    
    /** 생성 일시 */
    val createdAt: LocalDateTime
) {
    companion object {
        fun from(entity: LottoGameEntity): LottoGameResponse {
            return LottoGameResponse(
                id = entity.id!!,
                status = entity.status,
                number1 = entity.number1,
                number2 = entity.number2,
                number3 = entity.number3,
                number4 = entity.number4,
                number5 = entity.number5,
                number6 = entity.number6,
                createdAt = entity.createdAt ?: LocalDateTime.now()
            )
        }
    }
}
