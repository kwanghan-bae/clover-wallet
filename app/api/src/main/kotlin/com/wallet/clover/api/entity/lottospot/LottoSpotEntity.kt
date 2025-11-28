package com.wallet.clover.api.entity.lottospot

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("lotto_spot")
data class LottoSpotEntity(
    @Id val id: Long? = null,
    val name: String,
    val address: String,
    val latitude: Double,
    val longitude: Double,
    
    @Column("first_place_wins")
    val firstPlaceWins: Int = 0,
    
    @Column("second_place_wins")
    val secondPlaceWins: Int = 0,
    
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
