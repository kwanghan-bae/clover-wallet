package com.wallet.clover.api.controller

import com.wallet.clover.api.dto.LottoSpot
import com.wallet.clover.api.entity.lottospot.LottoWinningStoreEntity
import com.wallet.clover.api.service.LottoSpotService
import com.wallet.clover.api.service.LottoWinningStoreService
import kotlinx.coroutines.flow.flowOf
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
import java.time.LocalDateTime

@WebFluxTest(LottoSpotController::class)
@AutoConfigureWebTestClient
class LottoSpotControllerTest {

    @Autowired
    private lateinit var webTestClient: WebTestClient

    @MockBean
    private lateinit var lottoSpotService: LottoSpotService

    @MockBean
    private lateinit var lottoWinningStoreService: LottoWinningStoreService

    @Test
    fun `getAllLottoSpots should return flow of spots`() {
        val spot = LottoSpot.Response(
            id = 1L,
            name = "Store Name",
            address = "Address",
            latitude = 37.0,
            longitude = 127.0
        )

        runBlocking {
            given(lottoSpotService.getAllLottoSpots(0, 20)).willReturn(flowOf(spot))
        }

        webTestClient
            .mutateWith(mockJwt())
            .get()
            .uri("/api/v1/lotto-spots?page=0&size=20")
            .exchange()
            .expectStatus().isOk
            .expectBodyList(LottoSpot.Response::class.java)
            .hasSize(1)
            .consumeWith<WebTestClient.ListBodySpec<LottoSpot.Response>> { result ->
                val response = result.responseBody
                assert(response?.get(0)?.name == "Store Name")
            }
    }

    @Test
    fun `searchByName should return list of spots`() {
        val spot = LottoSpot.Response(
            id = 1L,
            name = "Store Name",
            address = "Address",
            latitude = 37.0,
            longitude = 127.0
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
            .expectBodyList(LottoSpot.Response::class.java)
            .hasSize(1)
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
            .jsonPath("$.data").isEqualTo("Crawling started for round $round")
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
