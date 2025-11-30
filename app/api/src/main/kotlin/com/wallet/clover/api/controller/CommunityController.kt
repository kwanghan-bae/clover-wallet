package com.wallet.clover.api.controller

import com.wallet.clover.api.common.CommonResponse
import com.wallet.clover.api.dto.*
import com.wallet.clover.api.service.CommunityService
import jakarta.validation.Valid
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/community")
class CommunityController(
    private val communityService: CommunityService,
) {

    @GetMapping("/posts")
    suspend fun getAllPosts(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): CommonResponse<List<PostResponse>> {
        return CommonResponse.success(communityService.getAllPosts(page, size))
    }

    @GetMapping("/posts/{postId}")
    suspend fun getPost(@PathVariable postId: Long): CommonResponse<PostResponse> {
        return CommonResponse.success(communityService.getPostById(postId))
    }

    @PostMapping("/posts")
    suspend fun createPost(
        @Valid @RequestBody request: CreatePostRequest,
        @AuthenticationPrincipal jwt: Jwt
    ): CommonResponse<PostResponse> {
        val userId = jwt.subject.toLong()
        return CommonResponse.success(communityService.createPost(userId, request))
    }

    @PutMapping("/posts/{postId}")
    suspend fun updatePost(
        @PathVariable postId: Long,
        @Valid @RequestBody request: UpdatePostRequest,
        @AuthenticationPrincipal jwt: Jwt
    ): CommonResponse<PostResponse> {
        val userId = jwt.subject.toLong()
        return CommonResponse.success(communityService.updatePost(postId, userId, request))
    }

    @GetMapping("/posts/{postId}/comments")
    suspend fun getComments(@PathVariable postId: Long): CommonResponse<List<CommentResponse>> {
        return CommonResponse.success(communityService.getCommentsByPostId(postId))
    }

    @PostMapping("/comments")
    suspend fun createComment(
        @Valid @RequestBody request: CreateCommentRequest,
        @AuthenticationPrincipal jwt: Jwt
    ): CommonResponse<CommentResponse> {
        val userId = jwt.subject.toLong()
        return CommonResponse.success(communityService.createComment(userId, request))
    }

    @PutMapping("/comments/{commentId}")
    suspend fun updateComment(
        @PathVariable commentId: Long,
        @Valid @RequestBody request: UpdateCommentRequest,
        @AuthenticationPrincipal jwt: Jwt
    ): CommonResponse<CommentResponse> {
        val userId = jwt.subject.toLong()
        return CommonResponse.success(communityService.updateComment(commentId, userId, request))
    }
}
