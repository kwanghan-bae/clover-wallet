package com.wallet.clover.api.service

import com.wallet.clover.api.TestFixtures
import com.wallet.clover.api.repository.lottospot.LottoSpotRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort

class LottoSpotServiceTest {

    private val lottoSpotRepository: LottoSpotRepository = mockk()
    private val lottoSpotService = LottoSpotService(lottoSpotRepository)

    @Test
    fun `getAllLottoSpots should return spots`() = runTest {
        // Given
        val page = 0
        val size = 10
        val spot = TestFixtures.createLottoSpot()
        coEvery { lottoSpotRepository.findAllBy(any()) } returns flowOf(spot)
        coEvery { lottoSpotRepository.count() } returns 1L

        // When
        val result = lottoSpotService.getAllLottoSpots(page, size)

        // Then
        assertEquals(1, result.content.size)
        assertEquals(spot.name, result.content[0].name)
        assertEquals(1L, result.totalElements)
        coVerify { lottoSpotRepository.findAllBy(PageRequest.of(page, size, Sort.by("id").descending())) }
    }

    @Test
    fun `searchByName should return matching spots`() = runTest {
        // Given
        val name = "Test"
        val spot = TestFixtures.createLottoSpot(name = "Test Spot")
        coEvery { lottoSpotRepository.findByNameContaining(name) } returns flowOf(spot)

        // When
        val result = lottoSpotService.searchByName(name)

        // Then
        assertEquals(1, result.size)
        assertEquals(spot.name, result[0].name)
        coVerify { lottoSpotRepository.findByNameContaining(name) }
    }
}
