package com.wallet.clover.api.service

import com.wallet.clover.api.TestFixtures
import com.wallet.clover.api.entity.game.LottoGameStatus
import com.wallet.clover.api.entity.ticket.LottoTicketStatus
import com.wallet.clover.api.repository.game.LottoGameRepository
import com.wallet.clover.api.repository.ticket.LottoTicketRepository
import com.wallet.clover.api.repository.user.UserRepository
import com.wallet.clover.api.repository.winning.WinningInfoRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Test
import org.springframework.transaction.ReactiveTransaction
import org.springframework.transaction.reactive.TransactionCallback
import org.springframework.transaction.reactive.TransactionalOperator
import reactor.core.publisher.Flux

class WinningCheckServiceTest {

    private val winningInfoRepository: WinningInfoRepository = mockk()
    private val lottoTicketRepository: LottoTicketRepository = mockk()
    private val lottoGameRepository: LottoGameRepository = mockk()
    private val fcmService: FcmService = mockk(relaxed = true)
    private val badgeService: BadgeService = mockk(relaxed = true)
    private val userRepository: UserRepository = mockk()
    private val transactionalOperator: TransactionalOperator = mockk()

    private val winningCheckService = WinningCheckService(
        winningInfoRepository,
        lottoTicketRepository,
        lottoGameRepository,
        fcmService,
        badgeService,
        userRepository,
        transactionalOperator
    )

    @Test
    fun `checkWinning should process tickets and update status`() = runTest {
        // Given
        val round = 1000
        val winningInfo = TestFixtures.createWinningInfo(round = round)
        val ticket = TestFixtures.createLottoTicket(id = 1L, ordinal = round, status = LottoTicketStatus.STASHED)
        val game = TestFixtures.createLottoGame(
            id = 1L,
            ticketId = 1L,
            number1 = 1, number2 = 2, number3 = 3, number4 = 4, number5 = 5, number6 = 6, // 1등 당첨 번호
            status = LottoGameStatus.LOSING
        )
        val user = TestFixtures.createUser(id = 1L, fcmToken = "token")

        coEvery { winningInfoRepository.findByRound(round) } returns winningInfo
        coEvery { lottoTicketRepository.findByOrdinal(round) } returns flowOf(ticket)
        
        // Mock TransactionalOperator.execute
        coEvery { transactionalOperator.execute(any<TransactionCallback<Any>>()) } answers {
            val callback = firstArg<TransactionCallback<Any>>()
            Flux.from(callback.doInTransaction(mockk()))
        }

        coEvery { lottoGameRepository.findByTicketIdIn(listOf(1L)) } returns flowOf(game)
        coEvery { lottoGameRepository.saveAll(any<List<com.wallet.clover.api.entity.game.LottoGameEntity>>()) } returns flowOf(game.copy(status = LottoGameStatus.WINNING_1))
        coEvery { lottoTicketRepository.saveAll(any<List<com.wallet.clover.api.entity.ticket.LottoTicketEntity>>()) } returns flowOf(ticket.copy(status = LottoTicketStatus.WINNING))
        coEvery { userRepository.findAllById(any<Iterable<Long>>()) } returns flowOf(user)

        // When
        winningCheckService.checkWinning(round)

        // Then
        coVerify { lottoGameRepository.findByTicketIdIn(any()) }
        coVerify { lottoGameRepository.saveAll(any<List<com.wallet.clover.api.entity.game.LottoGameEntity>>()) }
        coVerify { lottoTicketRepository.saveAll(any<List<com.wallet.clover.api.entity.ticket.LottoTicketEntity>>()) }
        coVerify { fcmService.sendWinningNotification(any(), any(), any(), any()) }
        coVerify { badgeService.updateUserBadges(1L) }
    }

    @Test
    fun `checkWinning should do nothing if winning info not found`() = runTest {
        // Given
        val round = 1000
        coEvery { winningInfoRepository.findByRound(round) } returns null

        // When
        winningCheckService.checkWinning(round)

        // Then
        coVerify(exactly = 0) { lottoTicketRepository.findByOrdinal(any()) }
    }
}
