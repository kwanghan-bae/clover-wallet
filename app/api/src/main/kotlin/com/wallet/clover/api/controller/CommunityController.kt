package com.wallet.clover.api.controller

import com.wallet.clover.api.dto.*
import com.wallet.clover.api.service.CommunityService
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.*

import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt

@RestController
@RequestMapping("/api/v1/community")
class CommunityController(
    private val communityService: CommunityService,
) {

    // ... (omitted)

    @PutMapping("/posts/{postId}")
    suspend fun updatePost(
        @PathVariable postId: Long,
        @Valid @RequestBody request: UpdatePostRequest,
        @AuthenticationPrincipal jwt: Jwt
    ): PostResponse {
        val userId = jwt.subject.toLong() // Assuming subject is userId
        return communityService.updatePost(postId, userId, request)
    }

    // ... (omitted)

    @PutMapping("/comments/{commentId}")
    suspend fun updateComment(
        @PathVariable commentId: Long,
        @Valid @RequestBody request: UpdateCommentRequest,
        @AuthenticationPrincipal jwt: Jwt
    ): CommentResponse {
        val userId = jwt.subject.toLong() // Assuming subject is userId
        return communityService.updateComment(commentId, userId, request)
    }
}
