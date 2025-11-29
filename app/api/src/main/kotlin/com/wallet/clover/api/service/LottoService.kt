package com.wallet.clover.api.service

import com.wallet.clover.api.client.LottoResultParser
import com.wallet.clover.api.client.LottoTicketClient
import com.wallet.clover.api.dto.LottoCheck
import com.wallet.clover.api.entity.game.LottoGameEntity
import com.wallet.clover.api.repository.game.LottoGameRepository
import org.springframework.stereotype.Service

@Service
class LottoService(
    private val lottoGameRepository: LottoGameRepository,
    private val notificationService: NotificationService,
    private val lottoTicketClient: LottoTicketClient,
    private val lottoResultParser: LottoResultParser
) {

    private val lottoUrl = "https://www.dhlottery.co.kr/gameResult.do?method=byWin"

    suspend fun checkWinnings(userId: Long): LottoCheck.Out {
        try {
            val html = lottoTicketClient.getHtmlByUrl(lottoUrl)
            val result = lottoResultParser.parse(html)

            val userGames = lottoGameRepository.findByUserId(userId)
            val winningResult = userGames.mapNotNull { game ->
                val userNumbers = game.getNumbers()
                val matchCount = userNumbers.intersect(result.winningNumbers.toSet()).size
                val isBonusMatched = userNumbers.contains(result.bonusNumber)

                val rank = when (matchCount) {
                    6 -> "1등"
                    5 -> if (isBonusMatched) "2등" else "3등"
                    4 -> "4등"
                    3 -> "5등"
                    else -> null // Not a winner
                }

                rank?.let {
                    // TODO: Fetch actual device token from DB
                    val dummyDeviceToken = "YOUR_USER_DEVICE_TOKEN_HERE" 
                    val winningAmount = "1,000,000원" // TODO: Calculate or fetch actual amount

                    notificationService.sendWinningNotification(dummyDeviceToken, winningAmount)

                    LottoCheck.UserWinningTicket(
                        round = result.round,
                        userNumbers = userNumbers,
                        matchedNumbers = userNumbers.intersect(result.winningNumbers.toSet()).toList(),
                        rank = it,
                    )
                }
            }

            return LottoCheck.Out(
                message = "${result.round}회차 당첨 확인 완료",
                winningNumbers = result.winningNumbers + result.bonusNumber,
                userWinningTickets = winningResult.takeIf { it.isNotEmpty() },
            )
        } catch (e: Exception) {
            return LottoCheck.Out(message = "당첨 번호 정보를 처리하는 중 오류가 발생했습니다: ${e.message}")
        }
    }

    private fun LottoGameEntity.getNumbers(): List<Int> {
        return listOf(number1, number2, number3, number4, number5, number6)
    }
}
