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
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

import com.wallet.clover.api.exception.ForbiddenException

@Service
@Transactional
class CommunityService(
    private val postRepository: PostRepository,
    private val commentRepository: CommentRepository,
) {
    // ... (omitted)

    suspend fun updatePost(postId: Long, userId: Long, request: UpdatePostRequest): PostResponse {
        val existingPost = postRepository.findById(postId) ?: throw PostNotFoundException("Post with id $postId not found")
        
        if (existingPost.userId != userId) {
            throw ForbiddenException("You are not allowed to update this post")
        }

        val updatedPost = existingPost.copy(
            title = request.title ?: existingPost.title,
            content = request.content ?: existingPost.content,
            updatedAt = LocalDateTime.now()
        )
        return postRepository.save(updatedPost).toResponse()
    }

    // ... (omitted)

    suspend fun updateComment(commentId: Long, userId: Long, request: UpdateCommentRequest): CommentResponse {
        val existingComment = commentRepository.findById(commentId) ?: throw CommentNotFoundException("Comment with id $commentId not found")
        
        if (existingComment.userId != userId) {
            throw ForbiddenException("You are not allowed to update this comment")
        }

        val updatedComment = existingComment.copy(
            content = request.content ?: existingComment.content,
            updatedAt = LocalDateTime.now()
        )
        return commentRepository.save(updatedComment).toResponse()
    }
}
