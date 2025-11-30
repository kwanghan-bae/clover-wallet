package com.wallet.clover.api.entity.lottospot

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("lotto_winning_store")
data class LottoWinningStoreEntity(
    @Id
    val id: Long? = null,
    val round: Int,
    val rank: Int, // 1 or 2
    val storeName: String,
    val address: String,
    val method: String? = null, // "자동", "수동", "반자동" (1등인 경우만)
    @CreatedDate
    val createdAt: LocalDateTime? = null
)
