package com.wallet.clover.api.application

import com.wallet.clover.api.endpoint.CommentResponse
import com.wallet.clover.api.endpoint.CreateCommentRequest
import com.wallet.clover.api.endpoint.CreatePostRequest
import com.wallet.clover.api.endpoint.PostResponse
import com.wallet.clover.api.endpoint.UpdateCommentRequest
import com.wallet.clover.api.endpoint.UpdatePostRequest
import com.wallet.clover.domain.community.Comment
import com.wallet.clover.domain.community.Post
import com.wallet.clover.entity.community.toDomain
import com.wallet.clover.entity.community.toEntity
import com.wallet.clover.repository.community.CommentRepository
import com.wallet.clover.repository.community.PostRepository
import jakarta.persistence.EntityNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CommunityService(
    private val postRepository: PostRepository,
    private val commentRepository: CommentRepository,
) {

    @Transactional
    fun createPost(request: CreatePostRequest): PostResponse {
        val post = Post(
            userId = request.userId,
            title = request.title,
            content = request.content,
        )
        return postRepository.save(post.toEntity()).toDomain().toResponse()
    }

    @Transactional(readOnly = true)
    fun getPost(postId: Long): PostResponse? {
        return postRepository.findById(postId)
            .map { it.toDomain().toResponse() }
            .orElse(null)
    }

    @Transactional(readOnly = true)
    fun getPosts(): List<PostResponse> {
        return postRepository.findAll().map { it.toDomain().toResponse() }
    }

    @Transactional
    fun updatePost(postId: Long, request: UpdatePostRequest): PostResponse {
        val postEntity = postRepository.findById(postId)
            .orElseThrow { EntityNotFoundException("Post not found with id: $postId") }

        postEntity.title = request.title
        postEntity.content = request.content

        return postRepository.save(postEntity).toDomain().toResponse()
    }

    @Transactional
    fun deletePost(postId: Long) {
        if (!postRepository.existsById(postId)) {
            throw EntityNotFoundException("Post not found with id: $postId")
        }
        commentRepository.deleteAll(commentRepository.findAllByPostId(postId)) // Delete associated comments
        postRepository.deleteById(postId)
    }

    @Transactional
    fun createComment(request: CreateCommentRequest): CommentResponse {
        val comment = Comment(
            postId = request.postId,
            userId = request.userId,
            content = request.content,
        )
        return commentRepository.save(comment.toEntity()).toDomain().toResponse()
    }

    @Transactional(readOnly = true)
    fun getCommentsForPost(postId: Long): List<CommentResponse> {
        return commentRepository.findAllByPostId(postId)
            .map { it.toDomain().toResponse() }
    }

    @Transactional
    fun updateComment(commentId: Long, request: UpdateCommentRequest): CommentResponse {
        val commentEntity = commentRepository.findById(commentId)
            .orElseThrow { EntityNotFoundException("Comment not found with id: $commentId") }

        commentEntity.content = request.content

        return commentRepository.save(commentEntity).toDomain().toResponse()
    }

    @Transactional
    fun deleteComment(commentId: Long) {
        if (!commentRepository.existsById(commentId)) {
            throw EntityNotFoundException("Comment not found with id: $commentId")
        }
        commentRepository.deleteById(commentId)
    }

    private fun Post.toResponse(): PostResponse = PostResponse(
        id = this.id,
        userId = this.userId,
        title = this.title,
        content = this.content,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
    )

    private fun Comment.toResponse(): CommentResponse = CommentResponse(
        id = this.id,
        postId = this.postId,
        userId = this.userId,
        content = this.content,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
    )
}
