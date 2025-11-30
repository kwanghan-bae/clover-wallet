package com.wallet.clover.api.entity.community

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("comment")
data class CommentEntity(
    /** 댓글 ID */
    @Id val id: Long? = null,
    
    /** 게시글 ID */
    val postId: Long,
    
    /** 작성자 ID */
    val userId: Long,
    
    /** 댓글 내용 */
    val content: String,
    
    /** 생성 일시 */
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    /** 수정 일시 */
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
