package com.wallet.clover.api.controller

import com.wallet.clover.api.dto.Comment
import com.wallet.clover.api.dto.CreateComment
import com.wallet.clover.api.dto.CreatePost
import com.wallet.clover.api.dto.Post
import com.wallet.clover.api.dto.UpdateComment
import com.wallet.clover.api.dto.UpdatePost
import com.wallet.clover.api.dto.UserSummary
import com.wallet.clover.api.service.CommunityService
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.csrf
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.mockJwt
import org.springframework.test.web.reactive.server.WebTestClient
import java.time.LocalDateTime

@WebFluxTest(CommunityController::class)
@AutoConfigureWebTestClient
class CommunityControllerTest {

    @Autowired
    private lateinit var webTestClient: WebTestClient

    @MockBean
    private lateinit var communityService: CommunityService

    @Test
    fun `게시글 목록 조회 성공`() {
        val userSummary = UserSummary(1L, "작성자", "http://profile.url")
        val posts = listOf(
            Post.Response(1L, userSummary, "제목", "내용", 0, 0, LocalDateTime.now(), LocalDateTime.now())
        )
        
        runBlocking {
            given(communityService.getAllPosts(0, 10)).willReturn(posts)
        }

        webTestClient.get().uri("/api/v1/community/posts?page=0&size=10")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.data[0].id").isEqualTo(1)
            .jsonPath("$.data[0].title").isEqualTo("제목")
    }

    @Test
    fun `게시글 상세 조회 성공`() {
        val userSummary = UserSummary(1L, "작성자", "http://profile.url")
        val post = Post.Response(1L, userSummary, "제목", "내용", 0, 0, LocalDateTime.now(), LocalDateTime.now())
        
        runBlocking {
            given(communityService.getPostById(1L)).willReturn(post)
        }

        webTestClient.get().uri("/api/v1/community/posts/1")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.data.id").isEqualTo(1)
            .jsonPath("$.data.title").isEqualTo("제목")
    }

    @Test
    fun `게시글 생성 성공`() {
        val request = CreatePost.Request("제목", "내용")
        val userSummary = UserSummary(1L, "작성자", "http://profile.url")
        val response = Post.Response(1L, userSummary, "제목", "내용", 0, 0, LocalDateTime.now(), LocalDateTime.now())
        
        runBlocking {
            given(communityService.createPost(eq(1L), any())).willReturn(response)
        }

        webTestClient.mutateWith(csrf()).mutateWith(mockJwt().jwt { it.subject("1") })
            .post().uri("/api/v1/community/posts")
            .bodyValue(request)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.data.id").isEqualTo(1)
            .jsonPath("$.data.title").isEqualTo("제목")
    }

    @Test
    fun `게시글 수정 성공`() {
        val request = UpdatePost.Request("수정된 제목", "수정된 내용")
        val userSummary = UserSummary(1L, "작성자", "http://profile.url")
        val response = Post.Response(1L, userSummary, "수정된 제목", "수정된 내용", 0, 0, LocalDateTime.now(), LocalDateTime.now())

        runBlocking {
            given(communityService.updatePost(eq(1L), eq(1L), any())).willReturn(response)
        }

        webTestClient.mutateWith(csrf()).mutateWith(mockJwt().jwt { it.subject("1") })
            .put().uri("/api/v1/community/posts/1")
            .bodyValue(request)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.data.title").isEqualTo("수정된 제목")
    }

    @Test
    fun `댓글 목록 조회 성공`() {
        val userSummary = UserSummary(1L, "작성자", "http://profile.url")
        val comments = listOf(
            Comment.Response(1L, 1L, userSummary, "댓글 내용", LocalDateTime.now(), LocalDateTime.now())
        )
        
        runBlocking {
            given(communityService.getCommentsByPostId(1L, 0, 20)).willReturn(comments)
        }

        webTestClient.get().uri("/api/v1/community/posts/1/comments")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.data[0].id").isEqualTo(1)
            .jsonPath("$.data[0].content").isEqualTo("댓글 내용")
    }

    @Test
    fun `댓글 생성 성공`() {
        val request = CreateComment.Request(1L, "댓글 내용")
        val userSummary = UserSummary(1L, "작성자", "http://profile.url")
        val response = Comment.Response(1L, 1L, userSummary, "댓글 내용", LocalDateTime.now(), LocalDateTime.now())

        runBlocking {
            given(communityService.createComment(eq(1L), any())).willReturn(response)
        }

        webTestClient.mutateWith(csrf()).mutateWith(mockJwt().jwt { it.subject("1") })
            .post().uri("/api/v1/community/comments")
            .bodyValue(request)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.data.content").isEqualTo("댓글 내용")
    }

    @Test
    fun `댓글 수정 성공`() {
        val request = UpdateComment.Request("수정된 댓글")
        val userSummary = UserSummary(1L, "작성자", "http://profile.url")
        val response = Comment.Response(1L, 1L, userSummary, "수정된 댓글", LocalDateTime.now(), LocalDateTime.now())

        runBlocking {
            given(communityService.updateComment(eq(1L), eq(1L), any())).willReturn(response)
        }

        webTestClient.mutateWith(csrf()).mutateWith(mockJwt().jwt { it.subject("1") })
            .put().uri("/api/v1/community/comments/1")
            .bodyValue(request)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.data.content").isEqualTo("수정된 댓글")
    }
}
