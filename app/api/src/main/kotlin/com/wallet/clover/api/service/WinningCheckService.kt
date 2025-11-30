package com.wallet.clover.api.service

import com.wallet.clover.api.entity.game.LottoGameEntity
import com.wallet.clover.api.entity.game.LottoGameStatus
import com.wallet.clover.api.entity.ticket.LottoTicketStatus
import com.wallet.clover.api.entity.winning.WinningInfoEntity
import com.wallet.clover.api.repository.game.LottoGameRepository
import com.wallet.clover.api.repository.ticket.LottoTicketRepository
import com.wallet.clover.api.repository.winning.WinningInfoRepository
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

        // 2. 해당 회차의 티켓 조회
        val tickets = lottoTicketRepository.findByOrdinal(round)
        logger.info("Found ${tickets.size} tickets for round $round")

        for (ticket in tickets) {
            val games = lottoGameRepository.findByTicketId(ticket.id!!)
            var ticketTotalPrize = 0L
            var hasWinningGame = false
            val winningGames = mutableListOf<LottoGameEntity>()

            for (game in games) {
                val (status, prize) = calculatePrize(game, winningInfo)
                
                if (game.status != status || game.prizeAmount != prize) {
                    val updatedGame = game.copy(
                        status = status,
                        prizeAmount = prize
                    )
                    lottoGameRepository.save(updatedGame)
                    logger.debug("Updated game ${game.id}: $status, $prize")
                    
                    if (status != LottoGameStatus.LOSING) {
                        winningGames.add(updatedGame)
                    }
                }
                
                if (prize > 0) {
                    ticketTotalPrize += prize
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
                lottoTicketRepository.save(updatedTicket)
                logger.info("Updated ticket ${ticket.id} status to $newTicketStatus")
                
                // 당첨 시 알림 및 뱃지 처리
                if (hasWinningGame) {
                    val user = userRepository.findById(ticket.userId)
                    user?.fcmToken?.let { token ->
                        // 가장 높은 등수의 게임 하나만 알림에 표시하거나, 요약해서 보냄
                        val bestGame = winningGames.minByOrNull { it.status.ordinal } // Enum ordinal이 낮을수록 높은 등수라고 가정 (확인 필요)
                        if (bestGame != null) {
                            fcmService.sendWinningNotification(token, getRankName(bestGame.status), listOf(bestGame.number1, bestGame.number2, bestGame.number3, bestGame.number4, bestGame.number5, bestGame.number6))
                        }
                    }
                    badgeService.updateUserBadges(ticket.userId)
                }
            }
        }
    }
    
    fun calculatePrize(game: LottoGameEntity, winningInfo: WinningInfoEntity): Pair<LottoGameStatus, Long> {
        val myNumbers = setOf(game.number1, game.number2, game.number3, game.number4, game.number5, game.number6)
        val winningNumbers = setOf(winningInfo.number1, winningInfo.number2, winningInfo.number3, winningInfo.number4, winningInfo.number5, winningInfo.number6)
        
        val matchCount = myNumbers.intersect(winningNumbers).size
        val bonusMatch = myNumbers.contains(winningInfo.bonusNumber)
        
        return when (matchCount) {
            6 -> LottoGameStatus.WINNING_1 to winningInfo.firstPrizeAmount
            5 -> if (bonusMatch) LottoGameStatus.WINNING_2 to winningInfo.secondPrizeAmount else LottoGameStatus.WINNING_3 to winningInfo.thirdPrizeAmount
            4 -> LottoGameStatus.WINNING_4 to winningInfo.fourthPrizeAmount
            3 -> LottoGameStatus.WINNING_5 to winningInfo.fifthPrizeAmount
            else -> LottoGameStatus.LOSING to 0L
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
