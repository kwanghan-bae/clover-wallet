package com.wallet.clover.api.entity.travel

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("travel_plan")
data class TravelPlanEntity(
    /** 여행 플랜 ID */
    @Id val id: Long? = null,
    
    /** 로또 명당 ID */
    val spotId: Long,
    
    /** 플랜 제목 */
    val title: String,
    
    /** 플랜 설명 */
    val description: String,
    
    /** 포함 장소 (JSON 배열) */
    val places: String,
    
    /** 테마 (자연, 문화, 맛집 등) */
    val theme: String,
    
    /** 예상 소요 시간 (시간) */
    val estimatedHours: Int,
    
    /** 생성 일시 */
    val createdAt: LocalDateTime = LocalDateTime.now()
)
