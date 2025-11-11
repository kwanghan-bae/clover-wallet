package com.wallet.clover.api.application

import com.wallet.clover.api.endpoint.LottoCheck
import org.jsoup.Jsoup
import org.springframework.stereotype.Service
import java.io.IOException

@Service
class LottoService {

    private val lottoUrl = "https://www.dhlottery.co.kr/gameResult.do?method=byWin"

    fun checkWinnings(): LottoCheck.Out {
        try {
            val doc = Jsoup.connect(lottoUrl).get()

            val round = doc.select("h4 > strong").first()?.text()?.replace(Regex("[^0-9]"), "")
            val winNumbers = doc.select(".win_result .nums .win p span.ball_645")
                .mapNotNull { it.text().toIntOrNull() }
            val bonusNumber = doc.select(".win_result .nums .bonus p span.ball_645").first()?.text()?.toIntOrNull()

            if (round == null || winNumbers.size != 6 || bonusNumber == null) {
                return LottoCheck.Out(message = "당첨 번호를 파싱하는 데 실패했습니다.")
            }

            val allWinningNumbers = winNumbers + bonusNumber

            return LottoCheck.Out(
                message = "${round}회차 당첨 번호를 성공적으로 가져왔습니다.",
                winningNumbers = allWinningNumbers,
                userWinningTickets = null, // TODO: Implement user ticket comparison logic
            )
        } catch (e: IOException) {
            // Handle network errors
            return LottoCheck.Out(message = "당첨 번호 정보를 가져오는 데 실패했습니다: 네트워크 오류")
        } catch (e: Exception) {
            // Handle other potential errors (e.g., parsing)
            return LottoCheck.Out(message = "당첨 번호 정보를 처리하는 중 오류가 발생했습니다.")
        }
    }
}
