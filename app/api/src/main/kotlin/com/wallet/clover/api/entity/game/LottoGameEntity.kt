package com.wallet.clover.api.entity.game

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("lotto_game")
data class LottoGameEntity(
    @Id val id: Long? = null,
    val userId: Long,
    val ticketId: Long,
    val status: LottoGameStatus,
    val number1: Int,
    val number2: Int,
    val number3: Int,
    val number4: Int,
    val number5: Int,
    val number6: Int,
    val extractionMethod: String? = null,  // 사용된 추출 방식 (ExtractionMethod enum 값)
    val prizeAmount: Long = 0, // 당첨금 (0이면 낙첨 또는 미확인)
    @CreatedDate
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
