package com.wallet.clover.api.repository.community

import com.wallet.clover.api.entity.community.PostLikeEntity
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Mono

@Repository
interface PostLikeRepository : ReactiveCrudRepository<PostLikeEntity, Long> {
    fun findByUserIdAndPostId(userId: Long, postId: Long): Mono<PostLikeEntity>
    fun existsByUserIdAndPostId(userId: Long, postId: Long): Mono<Boolean>
    fun countByPostId(postId: Long): Mono<Long>
}
