package com.wallet.clover.api.application

import com.wallet.clover.api.endpoint.LottoCheck
import com.wallet.clover.domain.game.LottoGame
import com.wallet.clover.repository.game.LottoGameRdbAdaptor
import org.jsoup.Jsoup
import org.springframework.stereotype.Service
import java.io.IOException

@Service
class LottoService(
    private val lottoGameRdbAdaptor: LottoGameRdbAdaptor,
) {

    private val lottoUrl = "https://www.dhlottery.co.kr/gameResult.do?method=byWin"

    fun checkWinnings(userId: Long): LottoCheck.Out {
        try {
            val doc = Jsoup.connect(lottoUrl).get()

            val roundText = doc.select("h4 > strong").first()?.text()?.replace(Regex("[^0-9]"), "")
            val winNumbers = doc.select(".win_result .nums .win p span.ball_645")
                .mapNotNull { it.text().toIntOrNull() }
            val bonusNumber = doc.select(".win_result .nums .bonus p span.ball_645").first()?.text()?.toIntOrNull()

            if (roundText == null || winNumbers.size != 6 || bonusNumber == null) {
                return LottoCheck.Out(message = "당첨 번호를 파싱하는 데 실패했습니다.")
            }

            val userGames = lottoGameRdbAdaptor.byUserId(userId)
            val winningResult = userGames.mapNotNull { game ->
                val userNumbers = game.getNumbers()
                val matchCount = userNumbers.intersect(winNumbers.toSet()).size
                val isBonusMatched = userNumbers.contains(bonusNumber)

                val rank = when (matchCount) {
                    6 -> "1등"
                    5 -> if (isBonusMatched) "2등" else "3등"
                    4 -> "4등"
                    3 -> "5등"
                    else -> null // Not a winner
                }

                rank?.let {
                    LottoCheck.UserWinningTicket(
                        round = roundText.toInt(),
                        userNumbers = userNumbers,
                        matchedNumbers = userNumbers.intersect(winNumbers.toSet()).toList(),
                        rank = it,
                    )
                }
            }

            return LottoCheck.Out(
                message = "${roundText}회차 당첨 확인 완료",
                winningNumbers = winNumbers + bonusNumber,
                userWinningTickets = winningResult.takeIf { it.isNotEmpty() },
            )
        } catch (e: IOException) {
            return LottoCheck.Out(message = "당첨 번호 정보를 가져오는 데 실패했습니다: 네트워크 오류")
        } catch (e: Exception) {
            return LottoCheck.Out(message = "당첨 번호 정보를 처리하는 중 오류가 발생했습니다: ${e.message}")
        }
    }

    private fun LottoGame.getNumbers(): List<Int> {
        return listOf(number1, number2, number3, number4, number5, number6)
    }
}
