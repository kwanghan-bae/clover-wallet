package com.wallet.clover.api.entity.community

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("post")
data class PostEntity(
    /** 게시글 ID */
    @Id val id: Long? = null,
    
    /** 작성자 ID */
    val userId: Long,
    
    /** 게시글 내용 */
    val content: String,
    
    /** 조회수 */
    val viewCount: Int = 0,
    
    /** 좋아요 수 */
    val likeCount: Int = 0,
    
    /** 생성 일시 */
    @CreatedDate
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    /** 수정 일시 */
    @LastModifiedDate
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
