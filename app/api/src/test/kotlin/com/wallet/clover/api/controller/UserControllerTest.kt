package com.wallet.clover.api.controller

import com.wallet.clover.api.dto.UpdateUserRequest
import com.wallet.clover.api.dto.UserResponse
import com.wallet.clover.api.service.UserService
import com.ninjasquad.springmockk.MockkBean
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.verify
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest
import org.springframework.http.MediaType
import org.springframework.test.web.reactive.server.WebTestClient
import reactor.core.publisher.Mono
import java.time.LocalDateTime

@WebFluxTest(UserController::class)
@DisplayName("UserController 테스트")
class UserControllerTest(@Autowired private val webClient: WebTestClient) {

    @MockkBean
    private lateinit var userService: UserService

    @Test
    @DisplayName("GET /api/v1/users/{id} - 존재하는 사용자 조회")
    fun `getUser returns user for existing id`() {
        // Given
        val userId = 1L
        val userResponse = UserResponse(
            id = userId,
            locale = "en",
            age = 30,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
        coEvery { userService.findUser(userId) } returns userResponse

        // When & Then
        webClient.get().uri("/api/v1/users/$userId")
            .accept(MediaType.APPLICATION_JSON)
            .exchange()
            .expectStatus().isOk
            .expectBody(UserResponse::class.java)
            .isEqualTo(userResponse)

        coVerify(exactly = 1) { userService.findUser(userId) }
    }

    @Test
    @DisplayName("GET /api/v1/users/{id} - 존재하지 않는 사용자 조회")
    fun `getUser returns 404 for non-existing id`() {
        // Given
        val userId = 2L
        coEvery { userService.findUser(userId) } returns null

        // When & Then
        webClient.get().uri("/api/v1/users/$userId")
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
        val updateRequest = UpdateUserRequest(locale = "ko", age = 31)
        val updatedUserResponse = UserResponse(
            id = userId,
            locale = "ko",
            age = 31,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
        coEvery { userService.updateUser(userId, updateRequest) } returns updatedUserResponse

        // When & Then
        webClient.put().uri("/api/v1/users/$userId")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(updateRequest)
            .exchange()
            .expectStatus().isOk
            .expectBody(UserResponse::class.java)
            .isEqualTo(updatedUserResponse)

        coVerify(exactly = 1) { userService.updateUser(userId, updateRequest) }
    }

    @Test
    @DisplayName("PUT /api/v1/users/{id} - 존재하지 않는 사용자 업데이트 시 404 반환")
    fun `updateUser returns 404 for non-existing user`() {
        // Given
        val userId = 3L
        val updateRequest = UpdateUserRequest(locale = "ko", age = 31)
        coEvery { userService.updateUser(userId, updateRequest) } throws NoSuchElementException("User with id $userId not found")

        // When & Then
        webClient.put().uri("/api/v1/users/$userId")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(updateRequest)
            .exchange()
            .expectStatus().isNotFound // or isBadRequest or 500 depending on exception handling

        coVerify(exactly = 1) { userService.updateUser(userId, updateRequest) }
    }
}
