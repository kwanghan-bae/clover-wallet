package com.wallet.clover.api.controller

import com.wallet.clover.api.service.DataInitializationService
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Test
import org.springframework.test.web.reactive.server.WebTestClient

class AdminControllerTest {

    private val dataInitializationService = mockk<DataInitializationService>(relaxed = true)
    private val adminController = AdminController(dataInitializationService)
    private val webTestClient = WebTestClient.bindToController(adminController).build()

    @Test
    fun `initHistory should trigger background initialization`() = runTest {
        webTestClient.post()
            .uri("/api/v1/admin/init/history?start=1&end=10")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.data").isEqualTo("History initialization started in background")

        // Allow some time for the coroutine to launch
        Thread.sleep(100)
        coVerify { dataInitializationService.initializeWinningInfo(1, 10) }
    }

    @Test
    fun `initSpots should trigger background initialization`() = runTest {
        webTestClient.post()
            .uri("/api/v1/admin/init/spots?start=5")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.data").isEqualTo("Store initialization started in background")

        // Allow some time for the coroutine to launch
        Thread.sleep(100)
        coVerify { dataInitializationService.initializeWinningStores(5, null) }
    }
}
