package com.wallet.clover.api.service

import com.wallet.clover.api.dto.LottoCheck
import com.wallet.clover.api.entity.game.LottoGameEntity
import com.wallet.clover.api.repository.game.LottoGameRepository
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.toList
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class LottoService(
    private val lottoGameRepository: LottoGameRepository,
    private val notificationService: NotificationService,
    private val winningNumberProvider: WinningNumberProvider
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    suspend fun checkWinnings(userId: Long): LottoCheck.Out {
        try {
            val result = winningNumberProvider.getLatestWinningNumbers()

            val winningResult = lottoGameRepository.findByUserId(userId)
                .map { game ->
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
                .filterNotNull()
                .toList()

            return LottoCheck.Out(
                message = "${result.round}회차 당첨 확인 완료",
                winningNumbers = result.winningNumbers + result.bonusNumber,
                userWinningTickets = winningResult.takeIf { it.isNotEmpty() },
            )
        } catch (e: Exception) {
            logger.error("Error checking winnings for user $userId", e)
            return LottoCheck.Out(message = "당첨 번호 정보를 처리하는 중 오류가 발생했습니다: ${e.message}")
        }
    }

    private fun LottoGameEntity.getNumbers(): List<Int> {
        return listOf(number1, number2, number3, number4, number5, number6)
    }
}
