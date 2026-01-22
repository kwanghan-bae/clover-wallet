package com.wallet.clover.api.service

import com.wallet.clover.api.TestFixtures
import com.wallet.clover.api.dto.CreateComment
import com.wallet.clover.api.dto.CreatePost
import com.wallet.clover.api.dto.UpdateComment
import com.wallet.clover.api.dto.UpdatePost
import com.wallet.clover.api.exception.ForbiddenException
import com.wallet.clover.api.exception.PostNotFoundException
import com.wallet.clover.api.repository.community.CommentRepository
import com.wallet.clover.api.repository.community.PostRepository
import com.wallet.clover.api.repository.community.PostLikeRepository
import com.wallet.clover.api.repository.user.UserRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort

class CommunityServiceTest {

    private val postRepository: PostRepository = mockk()
    private val commentRepository: CommentRepository = mockk()
    private val userRepository: UserRepository = mockk()
    private val postLikeRepository: PostLikeRepository = mockk()

    private val communityService = CommunityService(
        postRepository,
        commentRepository,
        userRepository,
        postLikeRepository
    )

    @Test
    fun `getAllPosts should return posts with user summary`() = runTest {
        // Given
        val page = 0
        val size = 10
        val userId = 1L
        val post = TestFixtures.createPost(userId = userId)
        val user = TestFixtures.createUser(id = userId)

        coEvery { postRepository.findAllBy(any()) } returns flowOf(post)
        coEvery { postRepository.count() } returns 1L
        coEvery { userRepository.findAllById(listOf(userId)) } returns flowOf(user)
        coEvery { postLikeRepository.findByUserIdAndPostIdIn(any(), any()) } returns emptyList()

        // When
        val result = communityService.getAllPosts(page, size)

        // Then
        assertEquals(1, result.content.size)
        assertEquals(post.content, result.content[0].content)
        assertEquals(user.ssoQualifier.substringBefore("@"), result.content[0].user?.nickname)
        assertEquals(1L, result.totalElements)
        
        coVerify { postRepository.findAllBy(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))) }
    }

    @Test
    fun `createPost should save post and return response`() = runTest {
        // Given
        val userId = 1L
        val request = CreatePost.Request(content = "New Post")
        val savedPost = TestFixtures.createPost(userId = userId, content = request.content)
        val user = TestFixtures.createUser(id = userId)

        coEvery { postRepository.save(any()) } returns savedPost
        coEvery { userRepository.findById(userId) } returns user

        // When
        val result = communityService.createPost(userId, request)

        // Then
        assertEquals(request.content, result.content)
        assertEquals(user.ssoQualifier.substringBefore("@"), result.user?.nickname)
        coVerify { postRepository.save(any()) }
    }

    @Test
    fun `updatePost should update post if user is owner`() = runTest {
        // Given
        val postId = 1L
        val userId = 1L
        val request = UpdatePost.Request(content = "Updated Content")
        val existingPost = TestFixtures.createPost(id = postId, userId = userId)
        val updatedPost = existingPost.copy(content = request.content!!)
        val user = TestFixtures.createUser(id = userId)

        coEvery { postRepository.findById(postId) } returns existingPost
        coEvery { postRepository.save(any()) } returns updatedPost
        coEvery { userRepository.findById(userId) } returns user
        coEvery { postLikeRepository.existsByUserIdAndPostId(userId, postId) } returns false

        // When
        val result = communityService.updatePost(postId, userId, request)

        // Then
        assertEquals(request.content, result.content)
        coVerify { postRepository.save(any()) }
    }

    @Test
    fun `updatePost should throw ForbiddenException if user is not owner`() = runTest {
        // Given
        val postId = 1L
        val userId = 1L
        val otherUserId = 2L
        val request = UpdatePost.Request(content = "Updated Content")
        val existingPost = TestFixtures.createPost(id = postId, userId = otherUserId)

        coEvery { postRepository.findById(postId) } returns existingPost

        // When
        val exception = runCatching { 
            communityService.updatePost(postId, userId, request) 
        }.exceptionOrNull()

        // Then
        assertNotNull(exception)
        assertEquals(ForbiddenException::class.java, exception!!::class.java)
    }

    @Test
    fun `createComment should save comment if post exists`() = runTest {
        // Given
        val userId = 1L
        val postId = 1L
        val request = CreateComment.Request(postId = postId, content = "New Comment")
        val post = TestFixtures.createPost(id = postId)
        val savedComment = TestFixtures.createComment(userId = userId, postId = postId, content = request.content)
        val user = TestFixtures.createUser(id = userId)

        coEvery { postRepository.findById(postId) } returns post
        coEvery { commentRepository.save(any()) } returns savedComment
        coEvery { userRepository.findById(userId) } returns user

        // When
        val result = communityService.createComment(userId, request)

        // Then
        assertEquals(request.content, result.content)
        coVerify { commentRepository.save(any()) }
    }

    @Test
    fun `createComment should throw PostNotFoundException if post does not exist`() = runTest {
        // Given
        val userId = 1L
        val postId = 1L
        val request = CreateComment.Request(postId = postId, content = "New Comment")

        coEvery { postRepository.findById(postId) } returns null

        // When
        val exception = runCatching { 
            communityService.createComment(userId, request) 
        }.exceptionOrNull()

        // Then
        assertNotNull(exception)
        assertEquals(PostNotFoundException::class.java, exception!!::class.java)
    }
}
