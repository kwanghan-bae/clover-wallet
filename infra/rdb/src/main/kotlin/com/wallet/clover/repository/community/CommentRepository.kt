package com.wallet.clover.repository.community

import com.wallet.clover.entity.community.CommentEntity
import org.springframework.data.jpa.repository.JpaRepository

interface CommentRepository : JpaRepository<CommentEntity, Long> {
    fun findAllByPostId(postId: Long): List<CommentEntity>
}
