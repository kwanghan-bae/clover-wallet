package com.wallet.clover.api.service

import com.wallet.clover.api.TestFixtures
import com.wallet.clover.api.client.ParsedLottoResult
import com.wallet.clover.api.entity.game.LottoGameEntity
import com.wallet.clover.api.entity.game.LottoGameStatus
import com.wallet.clover.api.entity.ticket.LottoTicketEntity
import com.wallet.clover.api.entity.ticket.LottoTicketStatus
import com.wallet.clover.api.entity.winning.WinningInfoEntity
import com.wallet.clover.api.repository.game.LottoGameRepository
import com.wallet.clover.api.repository.ticket.LottoTicketRepository
import com.wallet.clover.api.repository.user.UserRepository
import com.wallet.clover.api.repository.winning.WinningInfoRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.time.LocalDate

class LottoServiceTest {

    private val lottoGameRepository: LottoGameRepository = mockk()
    private val lottoTicketRepository: LottoTicketRepository = mockk()
    private val winningInfoRepository: WinningInfoRepository = mockk()
    private val fcmService: FcmService = mockk(relaxed = true)
    private val winningNumberProvider: WinningNumberProvider = mockk()
    private val userRepository: UserRepository = mockk()

    private val lottoService = LottoService(
        lottoGameRepository,
        lottoTicketRepository,
        winningInfoRepository,
        fcmService,
        winningNumberProvider,
        userRepository
    )

    @Test
    fun `checkWinnings should return empty result when no tickets found`() = runTest {
        // Given
        val userId = 1L
        val round = 1000
        val winningNumbers = listOf(1, 2, 3, 4, 5, 6)
        val bonusNumber = 7
        
        coEvery { winningNumberProvider.getLatestWinningNumbers() } returns ParsedLottoResult(
            round = round,
            winningNumbers = winningNumbers,
            bonusNumber = bonusNumber
        )
        coEvery { userRepository.findById(userId) } returns TestFixtures.createUser(id = userId)
        coEvery { winningInfoRepository.findByRound(round) } returns null
        coEvery { lottoTicketRepository.findByUserIdAndOrdinal(userId, round) } returns emptyList()

        // When
        val result = lottoService.checkWinnings(userId)

        // Then
        assertEquals("${round}회차 당첨 확인 완료", result.message)
        assertEquals(winningNumbers + bonusNumber, result.winningNumbers)
        assertTrue(result.userWinningTickets.isNullOrEmpty())
    }

    @Test
    fun `checkWinnings should detect winning tickets and send notification`() = runTest {
        // Given
        val userId = 1L
        val round = 1000
        val winningNumbers = listOf(1, 2, 3, 4, 5, 6)
        val bonusNumber = 7
        
        val winningInfo = WinningInfoEntity(
            round = round,
            drawDate = LocalDate.now(),
            number1 = 1, number2 = 2, number3 = 3, number4 = 4, number5 = 5, number6 = 6,
            bonusNumber = 7,
            firstPrizeAmount = 1000000000,
            secondPrizeAmount = 50000000,
            thirdPrizeAmount = 1000000,
            fourthPrizeAmount = 50000,
            fifthPrizeAmount = 5000
        )

        val ticket = LottoTicketEntity(
            id = 100L, 
            userId = userId, 
            ordinal = round,
            url = "http://test.com/image.jpg",
            status = LottoTicketStatus.STASHED
        )
        val winningGame = LottoGameEntity(
            id = 200L, 
            userId = userId,
            ticketId = 100L, 
            number1 = 1, number2 = 2, number3 = 3, number4 = 4, number5 = 5, number6 = 6,
            status = LottoGameStatus.LOSING
        )
        val losingGame = LottoGameEntity(
            id = 201L, 
            userId = userId,
            ticketId = 100L, 
            number1 = 10, number2 = 11, number3 = 12, number4 = 13, number5 = 14, number6 = 15,
            status = LottoGameStatus.LOSING
        )

        coEvery { winningNumberProvider.getLatestWinningNumbers() } returns ParsedLottoResult(
            round = round,
            winningNumbers = winningNumbers,
            bonusNumber = bonusNumber
        )
        coEvery { userRepository.findById(userId) } returns TestFixtures.createUser(id = userId, fcmToken = "test-token")
        coEvery { winningInfoRepository.findByRound(round) } returns winningInfo
        coEvery { lottoTicketRepository.findByUserIdAndOrdinal(userId, round) } returns listOf(ticket)
        coEvery { lottoGameRepository.findByTicketIdIn(listOf(100L)) } returns flowOf(winningGame, losingGame)
        coEvery { lottoGameRepository.save(any()) } returnsArgument 0

        // When
        val result = lottoService.checkWinnings(userId)
        println("Result: $result")

        // Then
        assertNotNull(result.userWinningTickets)
        assertEquals(1, result.userWinningTickets?.size)
        val winningTicket = result.userWinningTickets!!.first()
        assertEquals("1등", winningTicket.rank)
        assertEquals(listOf(1, 2, 3, 4, 5, 6), winningTicket.userNumbers)

        coVerify { fcmService.sendWinningNotification("test-token", "1등", any()) }
        coVerify(exactly = 1) { lottoGameRepository.save(any()) } // Only winning game status updated (PENDING -> WINNING_1)
    }
}
