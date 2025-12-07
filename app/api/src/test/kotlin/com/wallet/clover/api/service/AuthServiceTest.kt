package com.wallet.clover.api.service

import com.wallet.clover.api.TestFixtures
import com.wallet.clover.api.dto.Auth
import com.wallet.clover.api.entity.user.UserEntity
import com.wallet.clover.api.repository.auth.RefreshTokenRepository
import com.wallet.clover.api.repository.user.UserRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import io.mockk.just
import io.mockk.Runs
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.time.LocalDateTime

class AuthServiceTest {

    private val userRepository: UserRepository = mockk()
    private val jwtService: JwtService = mockk()
    private val refreshTokenRepository: RefreshTokenRepository = mockk()
    private val tokenBlacklistService: TokenBlacklistService = mockk()
    
    private val authService = AuthService(
        userRepository,
        jwtService,
        refreshTokenRepository,
        tokenBlacklistService
    )

    @Test
    fun `login should return existing user if found`() = runTest {
        // Given
        val ssoQualifier = "test-sso"
        val existingUser = TestFixtures.createUser(ssoQualifier = ssoQualifier)
        val accessToken = "access-token"
        val refreshToken = "refresh-token"
        
        coEvery { userRepository.findBySsoQualifier(ssoQualifier) } returns existingUser
        coEvery { jwtService.generateAccessToken(any()) } returns accessToken
        coEvery { jwtService.generateRefreshToken(any()) } returns refreshToken
        coEvery { jwtService.getRefreshTokenExpiry() } returns LocalDateTime.now().plusDays(7)
        coEvery { refreshTokenRepository.save(any()) } returns mockk()

        // When
        val result = authService.login(ssoQualifier)

        // Then
        assertEquals(existingUser, result.user)
        assertEquals(accessToken, result.accessToken)
        assertEquals(refreshToken, result.refreshToken)
        
        coVerify(exactly = 1) { userRepository.findBySsoQualifier(ssoQualifier) }
        coVerify(exactly = 0) { userRepository.save(any()) }
        coVerify(exactly = 1) { refreshTokenRepository.save(any()) }
    }

    @Test
    fun `login should create new user if not found`() = runTest {
        // Given
        val ssoQualifier = "new-sso"
        val newUser = TestFixtures.createUser(ssoQualifier = ssoQualifier)
        val accessToken = "access-token"
        val refreshToken = "refresh-token"
        
        coEvery { userRepository.findBySsoQualifier(ssoQualifier) } returns null
        coEvery { userRepository.save(any()) } returns newUser
        coEvery { jwtService.generateAccessToken(any()) } returns accessToken
        coEvery { jwtService.generateRefreshToken(any()) } returns refreshToken
        coEvery { jwtService.getRefreshTokenExpiry() } returns LocalDateTime.now().plusDays(7)
        coEvery { refreshTokenRepository.save(any()) } returns mockk()

        // When
        val result = authService.login(ssoQualifier)

        // Then
        assertEquals(newUser, result.user)
        assertEquals(accessToken, result.accessToken)
        assertEquals(refreshToken, result.refreshToken)
        
        coVerify(exactly = 1) { userRepository.findBySsoQualifier(ssoQualifier) }
        coVerify(exactly = 1) { userRepository.save(any()) }
        coVerify(exactly = 1) { refreshTokenRepository.save(any()) }
    }
}
