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
    private val userRepository: UserRepository,
    private val postLikeRepository: com.wallet.clover.api.repository.community.PostLikeRepository
) {
    @Transactional(readOnly = true)
    suspend fun getAllPosts(page: Int, size: Int, currentUserId: Long? = null): List<Post.Response> {
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        val posts = postRepository.findAllBy(pageable).toList()
        
        val userIds = posts.map { it.userId }.distinct()
        val users = userRepository.findAllById(userIds).toList().associateBy { it.id }

        // 현재 사용자의 좋아요 여부 조회
        val likedPostIds = if (currentUserId != null) {
            val postIds = posts.mapNotNull { it.id }
            // Batch 조회 로직이 없으므로 일단 개별 조회 혹은 전체 조회 후 필터링 (최적화 필요)
            // 여기서는 간단하게 구현
            // 실제로는 postLikeRepository.findByUserIdAndPostIdIn(...) 같은 메서드가 필요함
            // R2DBC에서는 IN 절이 까다로울 수 있으므로, 반복문으로 처리하거나 커스텀 쿼리 필요
            // 일단은 N+1 방지를 위해 전체 로직을 단순화
            mutableSetOf<Long>() // TODO: Implement batch check
        } else {
            emptySet()
        }

        return posts.map { post ->
            val user = users[post.userId]?.let { 
                UserSummary(it.id!!, it.ssoQualifier.substringBefore("@"), it.badges?.split(",") ?: emptyList()) 
            }
            // 개별 조회 (N+1 문제 발생 가능, 추후 최적화)
            val isLiked = if (currentUserId != null) {
                postLikeRepository.existsByUserIdAndPostId(currentUserId, post.id!!).block() ?: false
            } else {
                false
            }
            post.toResponse(user, isLiked)
        }
    }

    @Transactional(readOnly = true)
    suspend fun getPostById(postId: Long, currentUserId: Long? = null): Post.Response {
        val post = postRepository.findById(postId) ?: throw PostNotFoundException("Post with id $postId not found")
        val userEntity = userRepository.findById(post.userId)
        val user = userEntity?.let { 
            UserSummary(it.id!!, it.ssoQualifier.substringBefore("@"), it.badges?.split(",") ?: emptyList()) 
        }
        
        val isLiked = if (currentUserId != null) {
            postLikeRepository.existsByUserIdAndPostId(currentUserId, postId).block() ?: false
        } else {
            false
        }
        
        return post.toResponse(user, isLiked)
    }

    suspend fun createPost(userId: Long, request: CreatePost.Request): Post.Response {
        val newPost = request.toEntity(userId)
        val savedPost = postRepository.save(newPost)
        val userEntity = userRepository.findById(userId)
        val user = userEntity?.let { 
            UserSummary(it.id!!, it.ssoQualifier.substringBefore("@"), it.badges?.split(",") ?: emptyList()) 
        }
        return savedPost.toResponse(user, false)
    }

    suspend fun updatePost(postId: Long, userId: Long, request: UpdatePost.Request): Post.Response {
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
        
        val isLiked = postLikeRepository.existsByUserIdAndPostId(userId, postId).block() ?: false
        
        return savedPost.toResponse(user, isLiked)
    }

    suspend fun likePost(postId: Long, userId: Long): Post.Response {
        val post = postRepository.findById(postId) ?: throw PostNotFoundException("Post with id $postId not found")
        
        val existingLike = postLikeRepository.findByUserIdAndPostId(userId, postId).block()
        
        val updatedPost = if (existingLike != null) {
            // Unlike
            postLikeRepository.delete(existingLike).block()
            post.copy(likeCount = (post.likeCount - 1).coerceAtLeast(0))
        } else {
            // Like
            postLikeRepository.save(com.wallet.clover.api.entity.community.PostLikeEntity(userId = userId, postId = postId)).block()
            post.copy(likeCount = post.likeCount + 1)
        }
        
        val savedPost = postRepository.save(updatedPost)
        
        val userEntity = userRepository.findById(savedPost.userId)
        val user = userEntity?.let { 
            UserSummary(it.id!!, it.ssoQualifier.substringBefore("@"), it.badges?.split(",") ?: emptyList()) 
        }
        
        // Toggle result
        val isLiked = existingLike == null
        
        return savedPost.toResponse(user, isLiked)
    }

    @Transactional(readOnly = true)
    suspend fun getCommentsByPostId(postId: Long, page: Int = 0, size: Int = 20): List<Comment.Response> {
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

    suspend fun createComment(userId: Long, request: CreateComment.Request): Comment.Response {
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

    suspend fun updateComment(commentId: Long, userId: Long, request: UpdateComment.Request): Comment.Response {
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
