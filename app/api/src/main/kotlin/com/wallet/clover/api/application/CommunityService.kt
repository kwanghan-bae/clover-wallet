package com.wallet.clover.api.application

import com.wallet.clover.api.endpoint.CreatePostRequest
import com.wallet.clover.api.endpoint.PostResponse
import com.wallet.clover.api.endpoint.UpdatePostRequest
import com.wallet.clover.domain.community.Post
import com.wallet.clover.entity.community.toDomain
import com.wallet.clover.entity.community.toEntity
import com.wallet.clover.repository.community.PostRepository
import jakarta.persistence.EntityNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CommunityService(
    private val postRepository: PostRepository,
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
        postRepository.deleteById(postId)
    }

    private fun Post.toResponse(): PostResponse = PostResponse(
        id = this.id,
        userId = this.userId,
        title = this.title,
        content = this.content,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
    )
}
