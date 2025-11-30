package com.wallet.clover.api.entity.lottospot

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("lotto_winning_store")
data class LottoWinningStoreEntity(
    /** 당첨 판매점 ID */
    @Id
    val id: Long? = null,
    
    /** 회차 */
    val round: Int,
    
    /** 등수 (1 또는 2) */
    val rank: Int,
    
    /** 판매점 상호명 */
    val storeName: String,
    
    /** 판매점 주소 */
    val address: String,
    
    /** 당첨 방식 (자동, 수동, 반자동 - 1등인 경우만) */
    val method: String? = null,
    
    /** 생성 일시 */
    @CreatedDate
    val createdAt: LocalDateTime? = null
)
