package com.wallet.clover.api.service

import com.wallet.clover.api.TestFixtures
import com.wallet.clover.api.domain.extraction.ExtractionMethod
import com.wallet.clover.api.entity.game.LottoGameStatus
import com.wallet.clover.api.repository.game.LottoGameRepository
import com.wallet.clover.api.repository.user.UserRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class BadgeServiceTest {

    private val userRepository: UserRepository = mockk()
    private val lottoGameRepository: LottoGameRepository = mockk()
    private val badgeService = BadgeService(userRepository, lottoGameRepository)

    @Test
    fun `updateUserBadges should add FIRST_WIN badge`() = runTest {
        // Given
        val userId = 1L
        val user = TestFixtures.createUser(id = userId, fcmToken = null)
        
        coEvery { userRepository.findById(userId) } returns user
        coEvery { lottoGameRepository.countByUserId(userId) } returns 1L
        coEvery { lottoGameRepository.countWinningGamesByUserId(userId) } returns 1L
        coEvery { lottoGameRepository.existsByUserIdAndStatus(userId, any()) } returns false
        coEvery { lottoGameRepository.existsByUserIdAndExtractionMethodAndWinning(userId, any()) } returns false
        coEvery { userRepository.save(any()) } returns user

        // When
        badgeService.updateUserBadges(userId)

        // Then
        coVerify { userRepository.save(match { 
            it.badges?.contains(BadgeService.BADGE_FIRST_WIN) == true 
        }) }
    }

    @Test
    fun `updateUserBadges should add LUCKY_1ST badge`() = runTest {
        // Given
        val userId = 1L
        val user = TestFixtures.createUser(id = userId)
        
        coEvery { userRepository.findById(userId) } returns user
        coEvery { lottoGameRepository.countByUserId(userId) } returns 1L
        coEvery { lottoGameRepository.countWinningGamesByUserId(userId) } returns 1L
        coEvery { lottoGameRepository.existsByUserIdAndStatus(userId, LottoGameStatus.WINNING_1.name) } returns true
        coEvery { lottoGameRepository.existsByUserIdAndExtractionMethodAndWinning(userId, any()) } returns false
        coEvery { userRepository.save(any()) } returns user

        // When
        badgeService.updateUserBadges(userId)

        // Then
        coVerify { userRepository.save(match { 
            it.badges?.contains(BadgeService.BADGE_LUCKY_1ST) == true 
        }) }
    }

    @Test
    fun `updateUserBadges should add FREQUENT_PLAYER badge`() = runTest {
        // Given
        val userId = 1L
        val user = TestFixtures.createUser(id = userId)
        
        coEvery { userRepository.findById(userId) } returns user
        coEvery { lottoGameRepository.countByUserId(userId) } returns 10L
        coEvery { lottoGameRepository.countWinningGamesByUserId(userId) } returns 0L
        coEvery { lottoGameRepository.existsByUserIdAndStatus(userId, any()) } returns false
        coEvery { lottoGameRepository.existsByUserIdAndExtractionMethodAndWinning(userId, any()) } returns false
        coEvery { userRepository.save(any()) } returns user

        // When
        badgeService.updateUserBadges(userId)

        // Then
        coVerify { userRepository.save(match { 
            it.badges?.contains(BadgeService.BADGE_FREQUENT_PLAYER) == true 
        }) }
    }

    @Test
    fun `updateUserBadges should add extraction badges`() = runTest {
        // Given
        val userId = 1L
        val user = TestFixtures.createUser(id = userId)
        
        coEvery { userRepository.findById(userId) } returns user
        coEvery { lottoGameRepository.countByUserId(userId) } returns 1L
        coEvery { lottoGameRepository.countWinningGamesByUserId(userId) } returns 1L
        coEvery { lottoGameRepository.existsByUserIdAndStatus(userId, any()) } returns false
        
        // Mock extraction method check
        coEvery { lottoGameRepository.existsByUserIdAndExtractionMethodAndWinning(userId, ExtractionMethod.DREAM.name) } returns true
        coEvery { lottoGameRepository.existsByUserIdAndExtractionMethodAndWinning(userId, ExtractionMethod.SAJU.name) } returns false
        coEvery { lottoGameRepository.existsByUserIdAndExtractionMethodAndWinning(userId, ExtractionMethod.HOROSCOPE.name) } returns false
        coEvery { lottoGameRepository.existsByUserIdAndExtractionMethodAndWinning(userId, ExtractionMethod.NATURE_PATTERNS.name) } returns false
        coEvery { lottoGameRepository.existsByUserIdAndExtractionMethodAndWinning(userId, ExtractionMethod.STATISTICS_HOT.name) } returns false
        coEvery { lottoGameRepository.existsByUserIdAndExtractionMethodAndWinning(userId, ExtractionMethod.STATISTICS_COLD.name) } returns false

        coEvery { userRepository.save(any()) } returns user

        // When
        badgeService.updateUserBadges(userId)

        // Then
        coVerify { userRepository.save(match { 
            it.badges?.contains(BadgeService.BADGE_DREAM_MASTER) == true 
        }) }
    }
    
    @Test
    fun `getBadgeDisplayNames should return correct names`() {
        // Given
        val badges = listOf(BadgeService.BADGE_FIRST_WIN, BadgeService.BADGE_LUCKY_1ST, "UNKNOWN")

        // When
        val names = badgeService.getBadgeDisplayNames(badges)

        // Then
        assertEquals(2, names.size)
        assertEquals("첫 당첨", names[0])
        assertEquals("1등 당첨", names[1])
    }
}
