package com.wallet.clover.api.service

import com.wallet.clover.api.TestFixtures
import com.wallet.clover.api.entity.game.LottoGameStatus
import com.wallet.clover.api.repository.game.LottoGameRepository
import com.wallet.clover.api.repository.user.UserRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Test

class BadgeServiceTest {

    private val userRepository: UserRepository = mockk()
    private val lottoGameRepository: LottoGameRepository = mockk()
    private val badgeService = BadgeService(userRepository, lottoGameRepository)

    @Test
    fun `updateUserBadges should award FIRST_WIN badge on first win`() = runTest {
        // Given
        val userId = 1L
        val user = TestFixtures.createUser(id = userId, badges = "")
        coEvery { userRepository.findById(userId) } returns user
        coEvery { lottoGameRepository.countByUserId(userId) } returns 1
        coEvery { lottoGameRepository.countWinningGamesByUserId(userId) } returns 1
        coEvery { lottoGameRepository.existsByUserIdAndStatus(any(), any()) } returns false
        coEvery { lottoGameRepository.existsByUserIdAndExtractionMethodAndWinning(any(), any()) } returns false
        coEvery { userRepository.save(any()) } returns user

        // When
        badgeService.updateUserBadges(userId)

        // Then
        coVerify { userRepository.save(match { it.badges!!.contains("FIRST_WIN") }) }
    }

    @Test
    fun `updateUserBadges should award FREQUENT_PLAYER badge after 10 games`() = runTest {
        // Given
        val userId = 1L
        val user = TestFixtures.createUser(id = userId, badges = "")
        coEvery { userRepository.findById(userId) } returns user
        coEvery { lottoGameRepository.countByUserId(userId) } returns 10
        coEvery { lottoGameRepository.countWinningGamesByUserId(userId) } returns 0
        coEvery { lottoGameRepository.existsByUserIdAndStatus(any(), any()) } returns false
        coEvery { lottoGameRepository.existsByUserIdAndExtractionMethodAndWinning(any(), any()) } returns false
        coEvery { userRepository.save(any()) } returns user

        // When
        badgeService.updateUserBadges(userId)

        // Then
        coVerify { userRepository.save(match { it.badges!!.contains("FREQUENT_PLAYER") }) }
    }
}