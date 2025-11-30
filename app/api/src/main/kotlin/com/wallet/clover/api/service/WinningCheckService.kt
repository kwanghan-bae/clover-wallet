package com.wallet.clover.api.service

import com.wallet.clover.api.entity.game.LottoGameEntity
import com.wallet.clover.api.entity.game.LottoGameStatus
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
    private val lottoGameRepository: LottoGameRepository
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

            for (game in games) {
                val (statusStr, prize) = calculatePrize(game, winningInfo)
                val status = LottoGameStatus.valueOf(statusStr)
                
                if (game.status != status || game.prizeAmount != prize) {
                    val updatedGame = game.copy(
                        status = status,
                        prizeAmount = prize
                    )
                    lottoGameRepository.save(updatedGame)
                    logger.debug("Updated game ${game.id}: $status, $prize")
                }
                
                if (prize > 0) {
                    ticketTotalPrize += prize
                    hasWinningGame = true
                }
            }
            
            // 티켓 상태 업데이트 (당첨된 게임이 하나라도 있으면 WINNING, 아니면 LOSING)
            // 단, 아직 추첨 전인 경우는 처리하지 않음 (이 메서드는 추첨 후 호출됨)
            // val newTicketStatus = if (hasWinningGame) "WINNING" else "LOSING"
            // TODO: LottoTicketStatus Enum 변환 및 티켓 상태 업데이트 구현 필요
        }
    }
    
    fun calculatePrize(game: LottoGameEntity, winningInfo: WinningInfoEntity): Pair<String, Long> {
        val myNumbers = setOf(game.number1, game.number2, game.number3, game.number4, game.number5, game.number6)
        val winningNumbers = setOf(winningInfo.number1, winningInfo.number2, winningInfo.number3, winningInfo.number4, winningInfo.number5, winningInfo.number6)
        
        val matchCount = myNumbers.intersect(winningNumbers).size
        val bonusMatch = myNumbers.contains(winningInfo.bonusNumber)
        
        return when (matchCount) {
            6 -> "WINNING_1" to winningInfo.firstPrizeAmount
            5 -> if (bonusMatch) "WINNING_2" to winningInfo.secondPrizeAmount else "WINNING_3" to winningInfo.thirdPrizeAmount
            4 -> "WINNING_4" to winningInfo.fourthPrizeAmount
            3 -> "WINNING_5" to winningInfo.fifthPrizeAmount
            else -> "LOSING" to 0L
        }
    }
}
