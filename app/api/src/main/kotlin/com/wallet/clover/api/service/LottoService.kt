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

    /**
     * 사용자의 로또 게임 내역을 최신 당첨 번호와 대조하여 당첨 여부를 확인합니다.
     * 당첨된 경우 알림을 발송하고 당첨 내역을 반환합니다.
     *
     * @param userId 사용자 ID
     * @return 당첨 확인 결과 (당첨 번호 및 사용자 당첨 내역 포함)
     */
    suspend fun checkWinnings(userId: Long): LottoCheck.Out {
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
                    // TODO: 실제 사용자 디바이스 토큰을 DB에서 조회해야 함
                    val dummyDeviceToken = "YOUR_USER_DEVICE_TOKEN_HERE"
                    val winningAmount = "1,000,000원" // TODO: 실제 당첨금 계산 로직 필요

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
    }
}
