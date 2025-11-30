package com.wallet.clover.api.controller

import com.wallet.clover.api.dto.UpdateUser
import com.wallet.clover.api.dto.User
import com.wallet.clover.api.dto.UserStats
import com.wallet.clover.api.exception.UserNotFoundException
import com.wallet.clover.api.exception.handler.GlobalExceptionHandler
import com.wallet.clover.api.service.UserService
import com.wallet.clover.api.service.UserStatsService
import io.mockk.clearMocks
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.csrf
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.mockJwt
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.reactive.server.WebTestClient
import java.time.LocalDateTime

@WebFluxTest(UserController::class)
@Import(UserControllerTest.TestConfig::class, GlobalExceptionHandler::class)
@TestPropertySource(properties = ["supabase.jwt-secret=testsecretkeytestsecretkeytestsecretkeytestsecretkey"])
@DisplayName("UserController 테스트")
class UserControllerTest(@Autowired private val webClient: WebTestClient) {

    @Autowired
    private lateinit var userService: UserService

    @Autowired
    private lateinit var userStatsService: UserStatsService

    @TestConfiguration
    class TestConfig {
        @Bean
        fun userService() = mockk<UserService>(relaxed = true)

        @Bean
        fun userStatsService() = mockk<UserStatsService>(relaxed = true)
    }

    @BeforeEach
    fun setUp() {
        clearMocks(userService, userStatsService)
    }

    @Test
    @DisplayName("GET /api/v1/users/{id} - 존재하는 사용자 조회")
    fun `getUser returns user for existing id`() {
        // Given
        val userId = 1L
        val fixedTime = LocalDateTime.of(2023, 1, 1, 0, 0, 0)
        val userResponse = User.Response(
            id = userId,
            locale = "en",
            age = 30,
            createdAt = fixedTime,
            updatedAt = fixedTime
        )
        coEvery { userService.findUser(userId) } returns userResponse

        // When & Then
        webClient.mutateWith(mockJwt())
            .get().uri("/api/v1/users/$userId")
            .accept(MediaType.APPLICATION_JSON)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.id").isEqualTo(userId)
            .jsonPath("$.locale").isEqualTo("en")
            .jsonPath("$.age").isEqualTo(30)

        coVerify(exactly = 1) { userService.findUser(userId) }
    }

    @Test
    @DisplayName("GET /api/v1/users/{id} - 존재하지 않는 사용자 조회")
    fun `getUser returns 404 for non-existing id`() {
        // Given
        val userId = 2L
        coEvery { userService.findUser(userId) } returns null

        // When & Then
        webClient.mutateWith(mockJwt())
            .get().uri("/api/v1/users/$userId")
            .accept(MediaType.APPLICATION_JSON)
            .exchange()
            .expectStatus().isNotFound

        coVerify(exactly = 1) { userService.findUser(userId) }
    }

    @Test
    @DisplayName("PUT /api/v1/users/{id} - 사용자 정보 업데이트")
    fun `updateUser updates user info`() {
        // Given
        val userId = 1L
        val fixedTime = LocalDateTime.of(2023, 1, 1, 0, 0, 0)
        val updateRequest = UpdateUser.Request(locale = "ko", age = 31)
        val updatedUserResponse = User.Response(
            id = userId,
            locale = "ko",
            age = 31,
            createdAt = fixedTime,
            updatedAt = fixedTime
        )
        coEvery { userService.updateUser(userId, updateRequest) } returns updatedUserResponse

        // When & Then
        webClient.mutateWith(mockJwt()).mutateWith(csrf())
            .put().uri("/api/v1/users/$userId")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(updateRequest)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.id").isEqualTo(userId)
            .jsonPath("$.locale").isEqualTo("ko")
            .jsonPath("$.age").isEqualTo(31)

        coVerify(exactly = 1) { userService.updateUser(userId, updateRequest) }
    }

    @Test
    @DisplayName("PUT /api/v1/users/{id} - 존재하지 않는 사용자 업데이트 시 404 반환")
    fun `updateUser returns 404 for non-existing user`() {
        // Given
        val userId = 3L
        val updateRequest = UpdateUser.Request(locale = "ko", age = 31)
        coEvery { userService.updateUser(userId, updateRequest) } throws UserNotFoundException("User with id $userId not found")

        // When & Then
        webClient.mutateWith(mockJwt()).mutateWith(csrf())
            .put().uri("/api/v1/users/$userId")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(updateRequest)
            .exchange()
            .expectStatus().isNotFound

        coVerify(exactly = 1) { userService.updateUser(userId, updateRequest) }
    }

    @Test
    @DisplayName("DELETE /api/v1/users/me - 회원 탈퇴")
    fun `deleteAccount deletes user`() {
        // Given
        val userId = 1L
        coEvery { userService.deleteUserAccount(userId) } returns Unit

        // When & Then
        webClient.mutateWith(mockJwt().jwt { it.subject(userId.toString()) }).mutateWith(csrf())
            .delete().uri("/api/v1/users/me")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.data").isEqualTo("회원 탈퇴가 완료되었습니다")

        coVerify(exactly = 1) { userService.deleteUserAccount(userId) }
    }

    @Test
    @DisplayName("GET /api/v1/users/{userId}/stats - 사용자 통계 조회")
    fun `getUserStats returns stats`() {
        // Given
        val userId = 1L
        val statsResponse = UserStats.Response(
            totalGames = 10,
            totalWinnings = 10000L,
            totalSpent = 10000L,
            roi = 0
        )
        coEvery { userStatsService.getUserStats(userId) } returns statsResponse

        // When & Then
        webClient.mutateWith(mockJwt())
            .get().uri("/api/v1/users/$userId/stats")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.totalGames").isEqualTo(10)
            .jsonPath("$.totalWinnings").isEqualTo(10000L)
            .jsonPath("$.totalSpent").isEqualTo(10000L)
            .jsonPath("$.roi").isEqualTo(0)

        coVerify(exactly = 1) { userStatsService.getUserStats(userId) }
    }
}
