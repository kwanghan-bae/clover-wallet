package com.wallet.clover.api.entity.lottospot

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("lotto_spot")
data class LottoSpotEntity(
    /** 판매점 ID */
    @Id val id: Long? = null,
    /** 판매점 이름 */
    val name: String,
    /** 판매점 주소 */
    val address: String,
    /** 위도 */
    val latitude: Double,
    /** 경도 */
    val longitude: Double,
    
    @Column("first_place_wins")
    val firstPlaceWins: Int = 0,
    
    @Column("second_place_wins")
    val secondPlaceWins: Int = 0,
    
    /** 생성 일시 */
    val createdAt: LocalDateTime = LocalDateTime.now(),
    /** 수정 일시 */
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
