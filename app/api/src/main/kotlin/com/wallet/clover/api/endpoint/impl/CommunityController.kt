package com.wallet.clover.api.endpoint.impl

import com.wallet.clover.api.application.CommunityService
import com.wallet.clover.api.endpoint.CreatePostRequest
import com.wallet.clover.api.endpoint.PostResponse
import com.wallet.clover.api.endpoint.UpdatePostRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.net.URI

@RestController
@RequestMapping("/v1/community")
class CommunityController(
    private val communityService: CommunityService,
) {

    @PostMapping("/posts")
    fun createPost(@RequestBody request: CreatePostRequest): ResponseEntity<PostResponse> {
        val post = communityService.createPost(request)
        return ResponseEntity.created(URI.create("/v1/community/posts/${post.id}")).body(post)
    }

    @GetMapping("/posts/{postId}")
    fun getPost(@PathVariable postId: Long): ResponseEntity<PostResponse> {
        return communityService.getPost(postId)
            ?.let { ResponseEntity.ok(it) }
            ?: ResponseEntity.notFound().build()
    }

    @GetMapping("/posts")
    fun getPosts(): ResponseEntity<List<PostResponse>> {
        return ResponseEntity.ok(communityService.getPosts())
    }

    @PutMapping("/posts/{postId}")
    fun updatePost(@PathVariable postId: Long, @RequestBody request: UpdatePostRequest): ResponseEntity<PostResponse> {
        return ResponseEntity.ok(communityService.updatePost(postId, request))
    }

    @DeleteMapping("/posts/{postId}")
    fun deletePost(@PathVariable postId: Long): ResponseEntity<Void> {
        communityService.deletePost(postId)
        return ResponseEntity.noContent().build()
    }
}
