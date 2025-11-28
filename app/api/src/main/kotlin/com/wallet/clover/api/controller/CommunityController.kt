package com.wallet.clover.api.controller

import com.wallet.clover.api.entity.community.CommentEntity
import com.wallet.clover.api.entity.community.PostEntity
import com.wallet.clover.api.service.CommunityService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/community")
class CommunityController(
    private val communityService: CommunityService,
) {

    @GetMapping("/posts")
    suspend fun getAllPosts() = communityService.getAllPosts()

    @GetMapping("/posts/{postId}")
    suspend fun getPost(@PathVariable postId: Long) = communityService.getPostById(postId)

    @PostMapping("/posts")
    suspend fun createPost(@RequestBody post: PostEntity) = communityService.createPost(post)

    @GetMapping("/posts/{postId}/comments")
    suspend fun getComments(@PathVariable postId: Long) = communityService.getCommentsByPostId(postId)

    @PostMapping("/comments")
    suspend fun createComment(@RequestBody comment: CommentEntity) = communityService.createComment(comment)
}
