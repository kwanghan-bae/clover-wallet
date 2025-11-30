package com.wallet.clover.api.service

import com.wallet.clover.api.dto.*
import com.wallet.clover.api.entity.community.CommentEntity
import com.wallet.clover.api.entity.community.PostEntity
import com.wallet.clover.api.exception.CommentNotFoundException
import com.wallet.clover.api.exception.PostNotFoundException
import com.wallet.clover.api.repository.community.CommentRepository
import com.wallet.clover.api.repository.community.PostRepository
import com.wallet.clover.api.repository.user.UserRepository
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.flow.map
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
    private val userRepository: UserRepository
) {
    @Transactional(readOnly = true)
    suspend fun getAllPosts(page: Int, size: Int): List<PostResponse> {
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        val posts = postRepository.findAllBy(pageable).toList()
        
        val userIds = posts.map { it.userId }.distinct()
        val users = userRepository.findAllById(userIds).toList().associateBy { it.id }

        return posts.map { post ->
            val user = users[post.userId]?.let { 
                UserSummary(it.id!!, it.ssoQualifier.substringBefore("@"), it.badges?.split(",") ?: emptyList()) 
            }
            post.toResponse(user)
        }
    }

    @Transactional(readOnly = true)
    suspend fun getPostById(postId: Long): PostResponse {
        val post = postRepository.findById(postId) ?: throw PostNotFoundException("Post with id $postId not found")
        val userEntity = userRepository.findById(post.userId)
        val user = userEntity?.let { 
            UserSummary(it.id!!, it.ssoQualifier.substringBefore("@"), it.badges?.split(",") ?: emptyList()) 
        }
        return post.toResponse(user)
    }

    suspend fun createPost(userId: Long, request: CreatePostRequest): PostResponse {
        val newPost = request.toEntity(userId)
        val savedPost = postRepository.save(newPost)
        val userEntity = userRepository.findById(userId)
        val user = userEntity?.let { 
            UserSummary(it.id!!, it.ssoQualifier.substringBefore("@"), it.badges?.split(",") ?: emptyList()) 
        }
        return savedPost.toResponse(user)
    }

    suspend fun updatePost(postId: Long, userId: Long, request: UpdatePostRequest): PostResponse {
        val existingPost = postRepository.findById(postId) ?: throw PostNotFoundException("Post with id $postId not found")
        
        if (existingPost.userId != userId) {
            throw ForbiddenException("You are not allowed to update this post")
        }

        val updatedPost = existingPost.copy(
            content = request.content ?: existingPost.content,
            updatedAt = LocalDateTime.now()
        )
        val savedPost = postRepository.save(updatedPost)
        val userEntity = userRepository.findById(userId)
        val user = userEntity?.let { 
            UserSummary(it.id!!, it.ssoQualifier.substringBefore("@"), it.badges?.split(",") ?: emptyList()) 
        }
        return savedPost.toResponse(user)
    }

    @Transactional(readOnly = true)
    suspend fun getCommentsByPostId(postId: Long, page: Int = 0, size: Int = 20): List<CommentResponse> {
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"))
        val comments = commentRepository.findByPostId(postId, pageable).toList()
        
        val userIds = comments.map { it.userId }.distinct()
        val users = userRepository.findAllById(userIds).toList().associateBy { it.id }

        return comments.map { comment ->
            val user = users[comment.userId]?.let { 
                UserSummary(it.id!!, it.ssoQualifier.substringBefore("@"), it.badges?.split(",") ?: emptyList()) 
            }
            comment.toResponse(user)
        }
    }

    suspend fun createComment(userId: Long, request: CreateCommentRequest): CommentResponse {
        // Check if post exists
        postRepository.findById(request.postId) ?: throw PostNotFoundException("Post with id ${request.postId} not found")
        val newComment = request.toEntity(userId)
        val savedComment = commentRepository.save(newComment)
        val userEntity = userRepository.findById(userId)
        val user = userEntity?.let { 
            UserSummary(it.id!!, it.ssoQualifier.substringBefore("@"), it.badges?.split(",") ?: emptyList()) 
        }
        return savedComment.toResponse(user)
    }

    suspend fun updateComment(commentId: Long, userId: Long, request: UpdateCommentRequest): CommentResponse {
        val existingComment = commentRepository.findById(commentId) ?: throw CommentNotFoundException("Comment with id $commentId not found")
        
        if (existingComment.userId != userId) {
            throw ForbiddenException("You are not allowed to update this comment")
        }

        val updatedComment = existingComment.copy(
            content = request.content ?: existingComment.content,
            updatedAt = LocalDateTime.now()
        )
        val savedComment = commentRepository.save(updatedComment)
        val userEntity = userRepository.findById(userId)
        val user = userEntity?.let { 
            UserSummary(it.id!!, it.ssoQualifier.substringBefore("@"), it.badges?.split(",") ?: emptyList()) 
        }
        return savedComment.toResponse(user)
    }
}
