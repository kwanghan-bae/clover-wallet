package com.wallet.clover.api.repository.community

import com.wallet.clover.api.entity.community.CommentEntity
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository

@Repository
interface CommentRepository : CoroutineCrudRepository<CommentEntity, Long> {
    suspend fun findByPostId(postId: Long): List<CommentEntity>
    suspend fun findByUserId(userId: Long): List<CommentEntity>
    suspend fun deleteByUserId(userId: Long)
}
