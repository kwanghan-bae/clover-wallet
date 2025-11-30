package com.wallet.clover.api.service

import com.wallet.clover.api.TestFixtures
import com.wallet.clover.api.entity.user.UserEntity
import com.wallet.clover.api.repository.user.UserRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test

class AuthServiceTest {

    private val userRepository: UserRepository = mockk()
    private val authService = AuthService(userRepository)

    @Test
    fun `login should return existing user if found`() = runTest {
        // Given
        val ssoQualifier = "test-sso"
        val existingUser = TestFixtures.createUser(ssoQualifier = ssoQualifier)
        coEvery { userRepository.findBySsoQualifier(ssoQualifier) } returns existingUser

        // When
        val result = authService.login(ssoQualifier)

        // Then
        assertEquals(existingUser, result)
        coVerify(exactly = 1) { userRepository.findBySsoQualifier(ssoQualifier) }
        coVerify(exactly = 0) { userRepository.save(any()) }
    }

    @Test
    fun `login should create new user if not found`() = runTest {
        // Given
        val ssoQualifier = "new-sso"
        val newUser = TestFixtures.createUser(ssoQualifier = ssoQualifier)
        coEvery { userRepository.findBySsoQualifier(ssoQualifier) } returns null
        coEvery { userRepository.save(any()) } returns newUser

        // When
        val result = authService.login(ssoQualifier)

        // Then
        assertEquals(newUser, result)
        coVerify(exactly = 1) { userRepository.findBySsoQualifier(ssoQualifier) }
        coVerify(exactly = 1) { userRepository.save(any()) }
    }
}
