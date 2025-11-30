package com.wallet.clover.api.service

import com.wallet.clover.api.dto.LottoCheck
import com.wallet.clover.api.entity.game.LottoGameStatus
import com.wallet.clover.api.entity.winning.WinningInfoEntity
import com.wallet.clover.api.repository.game.LottoGameRepository
import com.wallet.clover.api.repository.ticket.LottoTicketRepository
import com.wallet.clover.api.repository.user.UserRepository
import com.wallet.clover.api.repository.winning.WinningInfoRepository
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.toList
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class LottoService(
    private val lottoGameRepository: LottoGameRepository,
    private val lottoTicketRepository: LottoTicketRepository,
    private val winningInfoRepository: WinningInfoRepository,
    private val notificationService: NotificationService,
    private val winningNumberProvider: WinningNumberProvider,
    private val userRepository: UserRepository
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    /**
     * 사용자의 로또 게임 내역을 최신 당첨 번호와 대조하여 당첨 여부를 확인합니다.
     * 당첨된 경우 알림을 발송하고 당첨 내역을 반환합니다.
     *
     * @param userId 사용자 ID
     * @return 당첨 확인 결과 (당첨 번호 및 사용자 당첨 내역 포함)
     */
    suspend fun checkWinnings(userId: Long): LottoCheck.Out {
        val result = winningNumberProvider.getLatestWinningNumbers()
        val user = userRepository.findById(userId)
        
        // 최신 회차의 당첨 정보 조회 (상금 정보 포함)
        val winningInfo = winningInfoRepository.findByRound(result.round) ?: WinningInfoEntity(
            round = result.round,
            drawDate = LocalDate.now(), // Dummy
            number1 = result.winningNumbers[0],
            number2 = result.winningNumbers[1],
            number3 = result.winningNumbers[2],
            number4 = result.winningNumbers[3],
            number5 = result.winningNumbers[4],
            number6 = result.winningNumbers[5],
            bonusNumber = result.bonusNumber,
            firstPrizeAmount = 0,
            secondPrizeAmount = 0,
            thirdPrizeAmount = 0,
            fourthPrizeAmount = 0,
            fifthPrizeAmount = 0
        )

        // 해당 회차의 사용자 티켓 조회
        val tickets = lottoTicketRepository.findByUserIdAndOrdinal(userId, result.round)
        val ticketIds = tickets.mapNotNull { it.id }
        
        val winningResult = if (ticketIds.isNotEmpty()) {
            lottoGameRepository.findByTicketIdIn(ticketIds)
                .map { game ->
                    val (status, _) = game.calculateRank(winningInfo)
                    
                    val rankName = when (status) {
                        LottoGameStatus.WINNING_1 -> "1등"
                        LottoGameStatus.WINNING_2 -> "2등"
                        LottoGameStatus.WINNING_3 -> "3등"
                        LottoGameStatus.WINNING_4 -> "4등"
                        LottoGameStatus.WINNING_5 -> "5등"
                        else -> null
                    }

                    rankName?.let {
                        user?.fcmToken?.let { token ->
                            val winningAmount = "당첨 확인 완료 ($it)"
                            notificationService.sendWinningNotification(token, winningAmount)
                        }

                        LottoCheck.UserWinningTicket(
                            round = result.round,
                            userNumbers = game.getNumbers(),
                            matchedNumbers = game.getNumbers().intersect(result.winningNumbers.toSet()).toList(),
                            rank = it,
                        )
                    }
                }
                .filterNotNull()
                .toList()
        } else {
            emptyList()
        }

        return LottoCheck.Out(
            message = "${result.round}회차 당첨 확인 완료",
            winningNumbers = result.winningNumbers + result.bonusNumber,
            userWinningTickets = winningResult.takeIf { it.isNotEmpty() },
        )
    }
}
