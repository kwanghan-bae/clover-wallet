package com.wallet.clover.api.repository.community

import com.wallet.clover.api.entity.community.PostLikeEntity
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository

@Repository
interface PostLikeRepository : CoroutineCrudRepository<PostLikeEntity, Long> {
    suspend fun findByUserIdAndPostId(userId: Long, postId: Long): PostLikeEntity?
    suspend fun findByUserIdAndPostIdIn(userId: Long, postIds: List<Long>): List<PostLikeEntity>
    suspend fun existsByUserIdAndPostId(userId: Long, postId: Long): Boolean
    suspend fun countByPostId(postId: Long): Long
}
