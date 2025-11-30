package com.wallet.clover.api.entity.user

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("users")
data class UserEntity(
    /** 사용자 고유 ID */
    @Id val id: Long? = null,
    
    /** SSO 식별자 (예: Google sub) */
    val ssoQualifier: String,
    
    /** 사용자 로케일 (기본값: ko_KR) */
    val locale: String = "ko_KR",
    
    /** 사용자 나이 */
    val age: Int = 0,
    
    /** FCM 토큰 (푸시 알림용) */
    val fcmToken: String? = null,
    
    /** 획득한 뱃지 목록 (콤마로 구분) */
    val badges: String? = null,
    
    /** 생성 일시 */
    @CreatedDate
    val createdAt: LocalDateTime? = null,
    
    /** 수정 일시 */
    @LastModifiedDate
    val updatedAt: LocalDateTime? = null
)
