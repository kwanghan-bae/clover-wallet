package com.wallet.clover.api.repository.community

import com.wallet.clover.api.entity.community.PostEntity
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository

@Repository
interface PostRepository : CoroutineCrudRepository<PostEntity, Long> {
    suspend fun findByUserId(userId: Long): List<PostEntity>
}
