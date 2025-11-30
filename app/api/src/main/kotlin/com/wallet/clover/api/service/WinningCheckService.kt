package com.wallet.clover.api.service

import com.wallet.clover.api.entity.game.LottoGameEntity
import com.wallet.clover.api.entity.game.LottoGameStatus
import com.wallet.clover.api.entity.ticket.LottoTicketStatus
import com.wallet.clover.api.entity.winning.WinningInfoEntity
import com.wallet.clover.api.repository.game.LottoGameRepository
import com.wallet.clover.api.repository.ticket.LottoTicketRepository
import com.wallet.clover.api.repository.winning.WinningInfoRepository
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.toList
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class WinningCheckService(
    private val winningInfoRepository: WinningInfoRepository,
    private val lottoTicketRepository: LottoTicketRepository,
    private val lottoGameRepository: LottoGameRepository,
    private val fcmService: FcmService,
    private val badgeService: BadgeService,
    private val userRepository: com.wallet.clover.api.repository.user.UserRepository
) {
    private val logger = LoggerFactory.getLogger(WinningCheckService::class.java)

    @Transactional
    suspend fun checkWinning(round: Int) {
        // 1. 해당 회차 당첨 정보 조회
        val winningInfo = winningInfoRepository.findByRound(round)
        if (winningInfo == null) {
            logger.warn("Winning info for round $round not found.")
            return
        }

        // 2. 해당 회차의 티켓 조회 (Flow로 스트리밍 처리)
        val tickets = lottoTicketRepository.findByOrdinal(round)
        logger.info("Starting ticket processing for round $round")

        val batchSize = 100
        val ticketBuffer = mutableListOf<com.wallet.clover.api.entity.ticket.LottoTicketEntity>()

        tickets.collect { ticket ->
            ticketBuffer.add(ticket)
            if (ticketBuffer.size >= batchSize) {
                processBatch(ticketBuffer, winningInfo)
                ticketBuffer.clear()
            }
        }

        if (ticketBuffer.isNotEmpty()) {
            processBatch(ticketBuffer, winningInfo)
        }
    }

    private suspend fun processBatch(
        tickets: List<com.wallet.clover.api.entity.ticket.LottoTicketEntity>,
        winningInfo: WinningInfoEntity
    ) {
        val ticketIds = tickets.mapNotNull { it.id }
        if (ticketIds.isEmpty()) return

        // 배치로 게임 조회
        val gamesFlow = lottoGameRepository.findByTicketIdIn(ticketIds)
        val gamesMap = gamesFlow.toList().groupBy { it.ticketId }

        val updatedGames = mutableListOf<LottoGameEntity>()
        val updatedTickets = mutableListOf<com.wallet.clover.api.entity.ticket.LottoTicketEntity>()
        val winningUserIds = mutableSetOf<Long>()
        val winningTickets = mutableListOf<Pair<com.wallet.clover.api.entity.ticket.LottoTicketEntity, LottoGameEntity>>() // Ticket and Best Game

        for (ticket in tickets) {
            val games = gamesMap[ticket.id] ?: emptyList()
            var hasWinningGame = false
            val ticketWinningGames = mutableListOf<LottoGameEntity>()

            for (game in games) {
                val (status, prize) = game.calculateRank(winningInfo)
                
                if (game.status != status || game.prizeAmount != prize) {
                    val updatedGame = game.copy(
                        status = status,
                        prizeAmount = prize
                    )
                    updatedGames.add(updatedGame)
                    
                    if (status != LottoGameStatus.LOSING) {
                        ticketWinningGames.add(updatedGame)
                    }
                } else {
                     // 상태가 변하지 않았더라도 당첨된 게임이면 리스트에 추가 (알림용)
                     if (game.status != LottoGameStatus.LOSING) {
                        ticketWinningGames.add(game)
                     }
                }
                
                if (prize > 0) {
                    hasWinningGame = true
                }
            }
            
            // 티켓 상태 업데이트
            val newTicketStatus = if (hasWinningGame) LottoTicketStatus.WINNING else LottoTicketStatus.LOSING
            
            if (ticket.status != newTicketStatus) {
                val updatedTicket = ticket.copy(
                    status = newTicketStatus,
                    updatedAt = java.time.LocalDateTime.now()
                )
                updatedTickets.add(updatedTicket)
                logger.info("Updated ticket ${ticket.id} status to $newTicketStatus")
                
                if (hasWinningGame) {
                    winningUserIds.add(ticket.userId)
                    // 가장 높은 등수의 게임 찾기
                    val bestGame = ticketWinningGames.maxByOrNull { it.status.ordinal }
                    if (bestGame != null) {
                        winningTickets.add(updatedTicket to bestGame)
                    }
                }
            }
        }

        // 배치 저장
        if (updatedGames.isNotEmpty()) {
            lottoGameRepository.saveAll(updatedGames).collect()
            logger.info("Batch updated ${updatedGames.size} games")
        }

        if (updatedTickets.isNotEmpty()) {
            lottoTicketRepository.saveAll(updatedTickets).collect()
            logger.info("Batch updated ${updatedTickets.size} tickets")
        }

        // 알림 및 뱃지 처리 (비동기 또는 배치)
        if (winningUserIds.isNotEmpty()) {
            val users = userRepository.findAllById(winningUserIds).toList().associateBy { it.id }
            
            for ((ticket, bestGame) in winningTickets) {
                val user = users[ticket.userId]
                user?.fcmToken?.let { token ->
                    fcmService.sendWinningNotification(
                        token, 
                        getRankName(bestGame.status), 
                        listOf(bestGame.number1, bestGame.number2, bestGame.number3, bestGame.number4, bestGame.number5, bestGame.number6)
                    )
                }
                // 뱃지 업데이트는 개별 호출 (서비스 내부 로직이 복잡할 수 있음)
                badgeService.updateUserBadges(ticket.userId)
            }
        }
    }
    
    private fun getRankName(status: LottoGameStatus): String {
        return when (status) {
            LottoGameStatus.WINNING_1 -> "1등"
            LottoGameStatus.WINNING_2 -> "2등"
            LottoGameStatus.WINNING_3 -> "3등"
            LottoGameStatus.WINNING_4 -> "4등"
            LottoGameStatus.WINNING_5 -> "5등"
            else -> "당첨"
        }
    }
}
