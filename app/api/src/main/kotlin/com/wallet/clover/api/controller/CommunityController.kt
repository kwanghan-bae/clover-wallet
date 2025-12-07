package com.wallet.clover.api.controller

import com.wallet.clover.api.common.CommonResponse
import com.wallet.clover.api.common.PageResponse
import com.wallet.clover.api.dto.Comment
import com.wallet.clover.api.dto.CreateComment
import com.wallet.clover.api.dto.CreatePost
import com.wallet.clover.api.dto.Post
import com.wallet.clover.api.dto.UpdateComment
import com.wallet.clover.api.dto.UpdatePost
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
        @RequestParam(defaultValue = "10") size: Int,
        @AuthenticationPrincipal jwt: Jwt?
    ): CommonResponse<PageResponse<Post.Response>> {
        val userId = jwt?.subject?.toLongOrNull()
        return CommonResponse.success(communityService.getAllPosts(page, size, userId))
    }

    @GetMapping("/posts/{postId}")
    suspend fun getPost(
        @PathVariable postId: Long,
        @AuthenticationPrincipal jwt: Jwt?
    ): CommonResponse<Post.Response> {
        val userId = jwt?.subject?.toLongOrNull()
        return CommonResponse.success(communityService.getPostById(postId, userId))
    }

    @PostMapping("/posts")
    suspend fun createPost(
        @Valid @RequestBody request: CreatePost.Request,
        @AuthenticationPrincipal jwt: Jwt
    ): CommonResponse<Post.Response> {
        val userId = jwt.subject.toLong()
        return CommonResponse.success(communityService.createPost(userId, request))
    }

    @PutMapping("/posts/{postId}")
    suspend fun updatePost(
        @PathVariable postId: Long,
        @Valid @RequestBody request: UpdatePost.Request,
        @AuthenticationPrincipal jwt: Jwt
    ): CommonResponse<Post.Response> {
        val userId = jwt.subject.toLong()
        return CommonResponse.success(communityService.updatePost(postId, userId, request))
    }

    @PostMapping("/posts/{postId}/like")
    suspend fun likePost(
        @PathVariable postId: Long,
        @AuthenticationPrincipal jwt: Jwt
    ): CommonResponse<Post.Response> {
        val userId = jwt.subject.toLong()
        return CommonResponse.success(communityService.likePost(postId, userId))
    }

    @GetMapping("/posts/{postId}/comments")
    suspend fun getComments(
        @PathVariable postId: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): CommonResponse<PageResponse<Comment.Response>> {
        return CommonResponse.success(communityService.getCommentsByPostId(postId, page, size))
    }

    @PostMapping("/comments")
    suspend fun createComment(
        @Valid @RequestBody request: CreateComment.Request,
        @AuthenticationPrincipal jwt: Jwt
    ): CommonResponse<Comment.Response> {
        val userId = jwt.subject.toLong()
        return CommonResponse.success(communityService.createComment(userId, request))
    }

    @PutMapping("/comments/{commentId}")
    suspend fun updateComment(
        @PathVariable commentId: Long,
        @Valid @RequestBody request: UpdateComment.Request,
        @AuthenticationPrincipal jwt: Jwt
    ): CommonResponse<Comment.Response> {
        val userId = jwt.subject.toLong()
        return CommonResponse.success(communityService.updateComment(commentId, userId, request))
    }
}
