package com.wallet.clover.api.service

import com.wallet.clover.api.entity.community.CommentEntity
import com.wallet.clover.api.entity.community.PostEntity
import com.wallet.clover.api.repository.community.CommentRepository
import com.wallet.clover.api.repository.community.PostRepository
import org.springframework.stereotype.Service

@Service
class CommunityService(
    private val postRepository: PostRepository,
    private val commentRepository: CommentRepository,
) {
    suspend fun getAllPosts(): List<PostEntity> {
        return postRepository.findAll().toList()
    }

    suspend fun getPostById(postId: Long): PostEntity? {
        return postRepository.findById(postId)
    }

    suspend fun createPost(post: PostEntity): PostEntity {
        return postRepository.save(post)
    }

    suspend fun getCommentsByPostId(postId: Long): List<CommentEntity> {
        return commentRepository.findByPostId(postId)
    }

    suspend fun createComment(comment: CommentEntity): CommentEntity {
        return commentRepository.save(comment)
    }
}

// Extension function to collect Flow to List
private suspend fun <T> kotlinx.coroutines.flow.Flow<T>.toList(): List<T> {
    val list = mutableListOf<T>()
    collect { list.add(it) }
    return list
}
