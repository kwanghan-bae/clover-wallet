package com.wallet.clover.api.service

import com.wallet.clover.api.dto.UpdateUserRequest
import com.wallet.clover.api.dto.UserResponse
import com.wallet.clover.api.dto.toResponse
import com.wallet.clover.api.entity.user.UserEntity
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
    private lateinit var userService: UserService

    @BeforeEach
    fun setUp() {
        userRepository = mockk()
        userService = UserService(userRepository)
    }

    @Test
    @DisplayName("사용자 ID로 사용자를 찾아 UserResponse로 반환한다")
    fun `findUser returns UserResponse for existing user`() = runTest {
        // Given
        val userId = 1L
        val userEntity = UserEntity(
            id = userId,
            ssoQualifier = "sso123",
            locale = "en",
            age = 30,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
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
    @DisplayName("사용자 정보를 업데이트하고 업데이트된 UserResponse를 반환한다")
    fun `updateUser updates user info and returns updated UserResponse`() = runTest {
        // Given
        val userId = 1L
        val originalUserEntity = UserEntity(
            id = userId,
            ssoQualifier = "sso123",
            locale = "en",
            age = 30,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
        val updateRequest = UpdateUserRequest(locale = "ko", age = 31)
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
        val updateRequest = UpdateUserRequest(locale = "ko", age = 31)
        coEvery { userRepository.findById(userId) } returns null

        // When
        val exception = runCatching { userService.updateUser(userId, updateRequest) }.exceptionOrNull()

        // Then
        assertNotNull(exception)
        assertEquals("User with id $userId not found", exception?.message)
        coVerify(exactly = 1) { userRepository.findById(userId) }
        coVerify(exactly = 0) { userRepository.save(any<UserEntity>()) }
    }
}
