package com.wallet.clover.api.service

import com.wallet.clover.api.TestFixtures
import com.wallet.clover.api.dto.UpdateUser
import com.wallet.clover.api.dto.User
import com.wallet.clover.api.dto.toResponse
import com.wallet.clover.api.entity.user.UserEntity
import com.wallet.clover.api.repository.community.CommentRepository
import com.wallet.clover.api.repository.community.PostRepository
import com.wallet.clover.api.repository.game.LottoGameRepository
import com.wallet.clover.api.repository.ticket.LottoTicketRepository
import com.wallet.clover.api.repository.user.UserRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import java.time.LocalDateTime

@DisplayName("UserService 테스트")
class UserServiceTest {

    private lateinit var userRepository: UserRepository
    private lateinit var commentRepository: CommentRepository
    private lateinit var postRepository: PostRepository
    private lateinit var lottoGameRepository: LottoGameRepository
    private lateinit var lottoTicketRepository: LottoTicketRepository
    private lateinit var userService: UserService

    @BeforeEach
    fun setUp() {
        userRepository = mockk()
        commentRepository = mockk(relaxed = true)
        postRepository = mockk(relaxed = true)
        lottoGameRepository = mockk(relaxed = true)
        lottoTicketRepository = mockk(relaxed = true)
        userService = UserService(
            userRepository,
            commentRepository,
            postRepository,
            lottoGameRepository,
            lottoTicketRepository
        )
    }

    @Test
    @DisplayName("사용자 ID로 사용자를 찾아 User.Response로 반환한다")
    fun `findUser returns UserResponse for existing user`() = runTest {
        // Given
        val userId = 1L
        val userEntity = TestFixtures.createUser(id = userId)
        coEvery { userRepository.findById(userId) } returns userEntity

        // When
        val result = userService.findUser(userId)

        // Then
        assertNotNull(result)
        assertEquals(userEntity.toResponse(), result)
        coVerify(exactly = 1) { userRepository.findById(userId) }
    }

    @Test
    @DisplayName("존재하지 않는 사용자 ID로 조회 시 null을 반환한다")
    fun `findUser returns null for non-existing user`() = runTest {
        // Given
        val userId = 2L
        coEvery { userRepository.findById(userId) } returns null

        // When
        val result = userService.findUser(userId)

        // Then
        assertNull(result)
        coVerify(exactly = 1) { userRepository.findById(userId) }
    }

    @Test
    @DisplayName("사용자 정보를 업데이트하고 업데이트된 User.Response를 반환한다")
    fun `updateUser updates user info and returns updated UserResponse`() = runTest {
        // Given
        val userId = 1L
        val originalUserEntity = TestFixtures.createUser(id = userId)
        val updateRequest = UpdateUser.Request(locale = "ko", age = 31)
        val updatedUserEntity = originalUserEntity.copy(
            locale = updateRequest.locale!!,
            age = updateRequest.age!!
        )

        coEvery { userRepository.findById(userId) } returns originalUserEntity
        coEvery { userRepository.save(any<UserEntity>()) } returns updatedUserEntity

        // When
        val result = userService.updateUser(userId, updateRequest)

        // Then
        assertNotNull(result)
        assertEquals(updatedUserEntity.toResponse(), result)
        coVerify(exactly = 1) { userRepository.findById(userId) }
        coVerify(exactly = 1) { userRepository.save(any<UserEntity>()) }
    }

    @Test
    @DisplayName("존재하지 않는 사용자 업데이트 시 예외를 발생시킨다")
    fun `updateUser throws exception for non-existing user`() = runTest {
        // Given
        val userId = 3L
        val updateRequest = UpdateUser.Request(locale = "ko", age = 31)
        coEvery { userRepository.findById(userId) } returns null

        // When
        val exception = runCatching { userService.updateUser(userId, updateRequest) }.exceptionOrNull()

        // Then
        assertNotNull(exception)
        assertEquals("User with id $userId not found", exception?.message)
        coVerify(exactly = 1) { userRepository.findById(userId) }
        coVerify(exactly = 0) { userRepository.save(any<UserEntity>()) }
    }

    @Test
    @DisplayName("사용자 계정 삭제 시 관련 데이터를 모두 삭제한다")
    fun `deleteUserAccount deletes all related data`() = runTest {
        // Given
        val userId = 1L
        coEvery { commentRepository.deleteByUserId(userId) } returns Unit
        coEvery { postRepository.deleteByUserId(userId) } returns Unit
        coEvery { lottoGameRepository.deleteByUserId(userId) } returns Unit
        coEvery { lottoTicketRepository.deleteByUserId(userId) } returns Unit
        coEvery { userRepository.deleteById(userId) } returns Unit

        // When
        userService.deleteUserAccount(userId)

        // Then
        coVerify(exactly = 1) { commentRepository.deleteByUserId(userId) }
        coVerify(exactly = 1) { postRepository.deleteByUserId(userId) }
        coVerify(exactly = 1) { lottoGameRepository.deleteByUserId(userId) }
        coVerify(exactly = 1) { lottoTicketRepository.deleteByUserId(userId) }
        coVerify(exactly = 1) { userRepository.deleteById(userId) }
    }
}
