package com.wallet.clover.api.service

import com.wallet.clover.api.dto.*
import com.wallet.clover.api.entity.community.CommentEntity
import com.wallet.clover.api.entity.community.PostEntity
import com.wallet.clover.api.exception.CommentNotFoundException
import com.wallet.clover.api.exception.PostNotFoundException
import com.wallet.clover.api.repository.community.CommentRepository
import com.wallet.clover.api.repository.community.PostRepository
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.toList
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional
class CommunityService(
    private val postRepository: PostRepository,
    private val commentRepository: CommentRepository,
) {
    @Transactional(readOnly = true)
    suspend fun getAllPosts(): List<PostResponse> {
        return postRepository.findAll().map { it.toResponse() }.toList()
    }

    @Transactional(readOnly = true)
    suspend fun getPostById(postId: Long): PostResponse {
        return (postRepository.findById(postId) ?: throw PostNotFoundException("Post with id $postId not found")).toResponse()
    }

    suspend fun createPost(request: CreatePostRequest): PostResponse {
        val newPost = request.toEntity()
        return postRepository.save(newPost).toResponse()
    }

    suspend fun updatePost(postId: Long, request: UpdatePostRequest): PostResponse {
        val existingPost = postRepository.findById(postId) ?: throw PostNotFoundException("Post with id $postId not found")
        val updatedPost = existingPost.copy(
            title = request.title ?: existingPost.title,
            content = request.content ?: existingPost.content,
            updatedAt = LocalDateTime.now()
        )
        return postRepository.save(updatedPost).toResponse()
    }

    @Transactional(readOnly = true)
    suspend fun getCommentsByPostId(postId: Long): List<CommentResponse> {
        return commentRepository.findByPostId(postId).map { it.toResponse() }.toList()
    }

    suspend fun createComment(request: CreateCommentRequest): CommentResponse {
        // Check if post exists
        postRepository.findById(request.postId) ?: throw PostNotFoundException("Post with id ${request.postId} not found")
        val newComment = request.toEntity()
        return commentRepository.save(newComment).toResponse()
    }

    suspend fun updateComment(commentId: Long, request: UpdateCommentRequest): CommentResponse {
        val existingComment = commentRepository.findById(commentId) ?: throw CommentNotFoundException("Comment with id $commentId not found")
        val updatedComment = existingComment.copy(
            content = request.content ?: existingComment.content,
            updatedAt = LocalDateTime.now()
        )
        return commentRepository.save(updatedComment).toResponse()
    }
}
