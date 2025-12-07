package com.wallet.clover.api.controller

import com.wallet.clover.api.config.JwtBlacklistFilter
import com.wallet.clover.api.dto.RegisterToken
import com.wallet.clover.api.service.FcmService
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.kotlin.any
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.csrf
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.mockJwt
import org.springframework.test.web.reactive.server.WebTestClient
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.WebFilterChain

@WebFluxTest(FcmController::class)
class FcmControllerTest {

    @Autowired
    private lateinit var webTestClient: WebTestClient

    @MockBean
    private lateinit var fcmService: FcmService

    @MockBean
    private lateinit var jwtBlacklistFilter: JwtBlacklistFilter

    @BeforeEach
    fun setUp() {
        given(jwtBlacklistFilter.filter(any(), any())).willAnswer { invocation ->
            val exchange = invocation.getArgument<ServerWebExchange>(0)
            val chain = invocation.getArgument<WebFilterChain>(1)
            chain.filter(exchange)
        }
    }

    @Test
    fun `registerToken should return success`() {
        val request = RegisterToken.Request("test-token")
        
        runBlocking {
            given(fcmService.registerToken(any(), any())).willReturn(Unit)
        }

        webTestClient
            .mutateWith(csrf())
            .mutateWith(mockJwt())
            .post()
            .uri("/api/v1/fcm/token")
            .bodyValue(request)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)
    }
}
