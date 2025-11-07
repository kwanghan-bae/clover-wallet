package com.wallet.clover.adapter

import com.wallet.clover.domain.lotto.LottoHistory
import org.springframework.stereotype.Component

@Component
class LottoHistoryMapper {
    fun toDomain(response: LottoResponse): LottoHistory? {
        if (response.returnValue != LottoResponseCode.OK) {
            return null
        }

        return LottoHistory(
            number1 = response.drwtNo1 ?: return null,
            number2 = response.drwtNo2 ?: return null,
            number3 = response.drwtNo3 ?: return null,
            number4 = response.drwtNo4 ?: return null,
            number5 = response.drwtNo5 ?: return null,
            number6 = response.drwtNo6 ?: return null,
            bonusNumber = response.bnusNo ?: return null,
            totalRevenue = response.totSellamnt ?: return null,
            countOfFirstWinners = response.firstPrzwnerCo ?: return null,
            moneyOfFirstWinner = response.firstWinamnt ?: return null,
            gameNumber = response.drwNo ?: return null,
            drawDate = response.drwNoDate ?: return null,
        )
    }
}
