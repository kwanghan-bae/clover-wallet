package com.wallet.clover.api.controller

import com.wallet.clover.api.common.PageResponse
import com.wallet.clover.api.config.JwtBlacklistFilter
import com.wallet.clover.api.dto.LottoSpot
import com.wallet.clover.api.dto.LottoWinningStore
import com.wallet.clover.api.entity.lottospot.LottoWinningStoreEntity
import com.wallet.clover.api.service.LottoSpotService
import com.wallet.clover.api.service.LottoWinningStoreService
import kotlinx.coroutines.runBlocking
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
import java.time.LocalDateTime

import org.junit.jupiter.api.BeforeEach
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.WebFilterChain

@WebFluxTest(LottoSpotController::class)
@AutoConfigureWebTestClient
class LottoSpotControllerTest {

    @Autowired
    private lateinit var webTestClient: WebTestClient

    @MockBean
    private lateinit var lottoSpotService: LottoSpotService

    @MockBean
    private lateinit var lottoWinningStoreService: LottoWinningStoreService

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
    fun `getAllLottoSpots should return page of spots`() {
        val spot = LottoSpot.Response(
            id = 1L,
            name = "Store Name",
            address = "Address",
            latitude = 37.0,
            longitude = 127.0,
            firstPlaceWins = 5,
            secondPlaceWins = 10
        )
        val pageResponse = PageResponse.of(listOf(spot), 0, 20, 1)

        runBlocking {
            given(lottoSpotService.getAllLottoSpots(any(), any())).willReturn(pageResponse)
        }

        webTestClient
            .mutateWith(mockJwt())
            .get()
            .uri("/api/v1/lotto-spots?page=0&size=20")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)
            .jsonPath("$.data.totalElements").isEqualTo(1)
    }

    @Test
    fun `searchByName should return list of spots`() {
        val spot = LottoSpot.Response(
            id = 1L,
            name = "Store Name",
            address = "Address",
            latitude = 37.0,
            longitude = 127.0,
            firstPlaceWins = 5,
            secondPlaceWins = 10
        )

        runBlocking {
            given(lottoSpotService.searchByName("Store")).willReturn(listOf(spot))
        }

        webTestClient
            .mutateWith(mockJwt())
            .get()
            .uri("/api/v1/lotto-spots/search?name=Store")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.data[0].name").isEqualTo("Store Name")
    }

    @Test
    fun `crawlStores should start crawling`() {
        val round = 1000
        
        runBlocking {
            given(lottoWinningStoreService.crawlWinningStores(round)).willReturn(Unit)
        }

        webTestClient
            .mutateWith(csrf())
            .mutateWith(mockJwt())
            .post()
            .uri("/api/v1/lotto-spots/crawl/$round")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)
    }

    @Test
    fun `getWinningStores should return list of winning stores`() {
        val round = 1000
        val store = LottoWinningStoreEntity(
            id = 1L,
            round = round,
            rank = 1,
            storeName = "Store Name",
            method = "Auto",
            address = "Address",
            createdAt = LocalDateTime.now()
        )

        runBlocking {
            given(lottoWinningStoreService.getWinningStores(round)).willReturn(listOf(store))
        }

        webTestClient
            .mutateWith(mockJwt())
            .get()
            .uri("/api/v1/lotto-spots/winning/$round")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.data[0].storeName").isEqualTo("Store Name")
    }
}
