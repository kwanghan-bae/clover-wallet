package com.wallet.clover.api.controller

import com.wallet.clover.api.dto.RegisterToken
import com.wallet.clover.api.service.FcmService
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.csrf
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.mockJwt
import org.springframework.test.web.reactive.server.WebTestClient

@WebFluxTest(FcmController::class)
@AutoConfigureWebTestClient
class FcmControllerTest {

    @Autowired
    private lateinit var webTestClient: WebTestClient

    @MockBean
    private lateinit var fcmService: FcmService

    @Test
    fun `registerToken should return success`() {
        val token = "fcm-token"
        val request = RegisterToken.Request(token)
        val ssoQualifier = "user-1"

        runBlocking {
            given(fcmService.registerToken(ssoQualifier, token)).willReturn(Unit)
        }

        webTestClient
            .mutateWith(csrf())
            .mutateWith(mockJwt().jwt { it.subject(ssoQualifier) })
            .post()
            .uri("/api/v1/fcm/token")
            .bodyValue(request)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)
    }
}
