package com.wallet.clover.api.repository.community

import com.wallet.clover.api.entity.community.PostEntity
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository
import kotlinx.coroutines.flow.Flow

@Repository
interface PostRepository : CoroutineCrudRepository<PostEntity, Long> {
    fun findAllBy(pageable: Pageable): Flow<PostEntity>
    fun findByUserId(userId: Long): Flow<PostEntity>
    suspend fun deleteByUserId(userId: Long)
}
