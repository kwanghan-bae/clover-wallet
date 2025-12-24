package com.wallet.clover.api.entity.ticket

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("lotto_ticket")
data class LottoTicketEntity(
    /** 티켓 고유 ID */
    @Id val id: Long? = null,
    
    /** 소유자 ID */
    val userId: Long,
    
    /** 티켓 이미지 URL (Supabase Storage) */
    val url: String? = null,
    
    /** 로또 회차 */
    val ordinal: Int,
    
    /** 티켓 상태 (STASHED, WINNING, LOSING) */
    val status: LottoTicketStatus,
    
    /** 생성 일시 */
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    /** 수정 일시 */
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
