package com.wallet.clover.api.controller

import com.wallet.clover.api.service.AuthService
import io.mockk.coEvery
import io.mockk.mockk
import org.junit.jupiter.api.Test
import org.springframework.http.MediaType
import org.springframework.test.web.reactive.server.WebTestClient

class AuthControllerTest {

    private val authService: AuthService = mockk()
    private val jwtDecoder: org.springframework.security.oauth2.jwt.ReactiveJwtDecoder = mockk()
    private val authController = AuthController(authService, jwtDecoder)
    private val webTestClient = WebTestClient.bindToController(authController).build()

    @Test
    fun `login should return token on success`() {
        // Given
        // Supabase JWT 형식의 더미 토큰 (header.payload.signature)
        val dummyToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIn0.sig"
        val loginRequest = mapOf("supabaseToken" to dummyToken)
        val mockResponse = com.wallet.clover.api.dto.Auth.LoginResponse(
            accessToken = "fake-access-token",
            refreshToken = "fake-refresh-token",
            user = com.wallet.clover.api.TestFixtures.createUser()
        )
        coEvery { authService.login(any(), any()) } returns mockResponse

        // When & Then
        webTestClient.post()
            .uri("/api/v1/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(loginRequest)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.data.accessToken").isEqualTo("fake-access-token")
    }
}
