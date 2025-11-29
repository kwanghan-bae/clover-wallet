package com.wallet.clover.api.controller

import com.wallet.clover.api.dto.*
import com.wallet.clover.api.service.CommunityService
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/community")
class CommunityController(
    private val communityService: CommunityService,
) {

    @GetMapping("/posts")
    suspend fun getAllPosts(): List<PostResponse> = communityService.getAllPosts()

    @GetMapping("/posts/{postId}")
    suspend fun getPost(@PathVariable postId: Long): PostResponse = communityService.getPostById(postId)

    @PostMapping("/posts")
    suspend fun createPost(@Valid @RequestBody request: CreatePostRequest): PostResponse = communityService.createPost(request)

    @PutMapping("/posts/{postId}")
    suspend fun updatePost(@PathVariable postId: Long, @Valid @RequestBody request: UpdatePostRequest): PostResponse =
        communityService.updatePost(postId, request)

    @GetMapping("/posts/{postId}/comments")
    suspend fun getComments(@PathVariable postId: Long): List<CommentResponse> = communityService.getCommentsByPostId(postId)

    @PostMapping("/comments")
    suspend fun createComment(@Valid @RequestBody request: CreateCommentRequest): CommentResponse =
        communityService.createComment(request)

    @PutMapping("/comments/{commentId}")
    suspend fun updateComment(@PathVariable commentId: Long, @Valid @RequestBody request: UpdateCommentRequest): CommentResponse =
        communityService.updateComment(commentId, request)
}
