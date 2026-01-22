package com.wallet.clover.api.service

import com.wallet.clover.api.entity.game.LottoGameEntity
import com.wallet.clover.api.entity.game.LottoGameStatus
import com.wallet.clover.api.entity.ticket.LottoTicketEntity
import com.wallet.clover.api.entity.ticket.LottoTicketStatus
import com.wallet.clover.api.entity.winning.WinningInfoEntity
import com.wallet.clover.api.repository.game.LottoGameRepository
import com.wallet.clover.api.repository.ticket.LottoTicketRepository
import com.wallet.clover.api.repository.winning.WinningInfoRepository
import kotlinx.coroutines.flow.toList
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.reactive.TransactionalOperator
import org.springframework.transaction.reactive.executeAndAwait

@Service
class WinningCheckService(
    private val winningInfoRepository: WinningInfoRepository,
    private val winningInfoCrawler: WinningInfoCrawler,
    private val lottoTicketRepository: LottoTicketRepository,
    private val lottoGameRepository: LottoGameRepository,
    private val fcmService: FcmService,
    private val badgeService: BadgeService,
    private val userRepository: com.wallet.clover.api.repository.user.UserRepository,
    private val transactionalOperator: TransactionalOperator
) {
    private val logger = LoggerFactory.getLogger(WinningCheckService::class.java)

    suspend fun checkWinning(round: Int) {
        // 1. 해당 회차 당첨 정보 조회
        var winningInfo = winningInfoRepository.findByRound(round)
        if (winningInfo == null) {
            logger.info("$round 회차 정보 DB 미발견. 크롤링 시도...")
            try {
                winningInfoCrawler.crawlWinningInfo(round)
                winningInfo = winningInfoRepository.findByRound(round)
            } catch (e: Exception) {
                logger.error("$round 회차 정보 수집 실패", e)
            }
        }

        if (winningInfo == null) {
            logger.warn("$round 회차 당첨 정보를 찾을 수 없습니다. (크롤링 실패 포함)")
            return
        }

        // 2. 해당 회차의 티켓 조회 (List 패턴 사용)
        val tickets = lottoTicketRepository.findByOrdinal(round).toList()
        logger.info("$round 회차 티켓 ${tickets.size}건 처리 시작")

        if (tickets.isEmpty()) return

        // 100개씩 청크로 나누어 처리
        tickets.chunked(100).forEach { batch ->
            processBatchSafe(batch, winningInfo)
        }
    }

    private suspend fun processBatchSafe(
        tickets: List<LottoTicketEntity>,
        winningInfo: WinningInfoEntity
    ) {
        try {
            processBatch(tickets, winningInfo)
        } catch (e: Exception) {
            logger.error("티켓 배치 처리 오류", e)
        }
    }

    private suspend fun processBatch(
        tickets: List<LottoTicketEntity>,
        winningInfo: WinningInfoEntity
    ) {
        val ticketIds = tickets.mapNotNull { it.id }
        if (ticketIds.isEmpty()) return

        val (winningTickets, winningUserIds) = transactionalOperator.executeAndAwait {
            // 배치로 게임 조회
            val gamesFlow = lottoGameRepository.findByTicketIdIn(ticketIds)
            val gamesMap = gamesFlow.toList().groupBy { it.ticketId }

            val updatedGames = mutableListOf<LottoGameEntity>()
            val updatedTickets = mutableListOf<LottoTicketEntity>()
            val winningUserIds = mutableSetOf<Long>()
            val winningTickets = mutableListOf<Pair<LottoTicketEntity, LottoGameEntity>>()

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
                    } else if (game.status != LottoGameStatus.LOSING) {
                        ticketWinningGames.add(game)
                    }
                    
                    if (prize > 0) {
                        hasWinningGame = true
                    }
                }
                
                val newTicketStatus = if (hasWinningGame) LottoTicketStatus.WINNING else LottoTicketStatus.LOSING
                
                if (ticket.status != newTicketStatus) {
                    val updatedTicket = ticket.copy(
                        status = newTicketStatus,
                        updatedAt = java.time.LocalDateTime.now()
                    )
                    updatedTickets.add(updatedTicket)
                    
                    if (hasWinningGame) {
                        winningUserIds.add(ticket.userId)
                        val bestGame = ticketWinningGames.maxByOrNull { it.status.ordinal }
                        if (bestGame != null) {
                            winningTickets.add(updatedTicket to bestGame)
                        }
                    }
                }
            }

            // 배치 저장 (saveAll 결과 Flow를 List로 변환하여 처리)
            if (updatedGames.isNotEmpty()) {
                lottoGameRepository.saveAll(updatedGames).toList()
                logger.info("${updatedGames.size}개 게임 업데이트 완료")
            }

            if (updatedTickets.isNotEmpty()) {
                lottoTicketRepository.saveAll(updatedTickets).toList()
                logger.info("${updatedTickets.size}개 티켓 업데이트 완료")
            }
            
            winningTickets to winningUserIds
        } ?: (emptyList<Pair<LottoTicketEntity, LottoGameEntity>>() to emptySet<Long>())

        if (winningUserIds.isNotEmpty()) {
            notifyWinners(winningUserIds, winningTickets)
        }
    }

    private suspend fun notifyWinners(
        winningUserIds: Set<Long>,
        winningTickets: List<Pair<LottoTicketEntity, LottoGameEntity>>
    ) {
        val users = userRepository.findAllById(winningUserIds).toList().associateBy { it.id }
        
        for ((ticket, bestGame) in winningTickets) {
            val user = users[ticket.userId]
            user?.fcmToken?.let { token ->
                try {
                    fcmService.sendWinningNotification(
                        token, 
                        getRankName(bestGame.status), 
                        listOf(bestGame.number1, bestGame.number2, bestGame.number3, bestGame.number4, bestGame.number5, bestGame.number6),
                        bestGame.prizeAmount
                    )
                } catch (e: Exception) {
                    logger.error("사용자 ${ticket.userId}에게 FCM 전송 실패", e)
                }
            }
            try {
                badgeService.updateUserBadges(ticket.userId)
            } catch (e: Exception) {
                logger.error("사용자 ${ticket.userId}의 뱃지 업데이트 실패", e)
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