package com.wallet.clover.api.service

import com.wallet.clover.api.TestFixtures
import com.wallet.clover.api.repository.user.UserRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Test

class FcmServiceTest {

    private val userRepository: UserRepository = mockk()
    private val fcmService = FcmService(userRepository)

    @Test
    fun `registerToken should update user token`() = runTest {
        // Given
        val ssoQualifier = "test-sso"
        val token = "new-token"
        val user = TestFixtures.createUser(ssoQualifier = ssoQualifier, fcmToken = "old-token")
        
        coEvery { userRepository.findBySsoQualifier(ssoQualifier) } returns user
        coEvery { userRepository.save(any()) } returns user.copy(fcmToken = token)

        // When
        fcmService.registerToken(ssoQualifier, token)

        // Then
        coVerify { userRepository.save(match { 
            it.fcmToken == token 
        }) }
    }

    @Test
    fun `registerToken should do nothing if user not found`() = runTest {
        // Given
        val ssoQualifier = "unknown"
        val token = "token"
        
        coEvery { userRepository.findBySsoQualifier(ssoQualifier) } returns null

        // When
        fcmService.registerToken(ssoQualifier, token)

        // Then
        coVerify(exactly = 0) { userRepository.save(any()) }
    }

    @Test
    fun `sendToUser should skip if Firebase not initialized`() = runTest {
        // Given
        val token = "token"
        val title = "Title"
        val body = "Body"

        // When
        fcmService.sendToUser(token, title, body)

        // Then
        // No exception should be thrown, and it should log a warning (which we can't easily verify without log capture, but we verify it doesn't crash)
    }
}
