package com.wallet.clover.api.repository.community

import com.wallet.clover.api.entity.community.CommentEntity
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository
import kotlinx.coroutines.flow.Flow

@Repository
interface CommentRepository : CoroutineCrudRepository<CommentEntity, Long> {
    suspend fun findByPostId(postId: Long): List<CommentEntity>
    fun findByPostId(postId: Long, pageable: Pageable): Flow<CommentEntity>
    suspend fun findByUserId(userId: Long): List<CommentEntity>
    suspend fun deleteByUserId(userId: Long)
    suspend fun countByPostId(postId: Long): Long
}
