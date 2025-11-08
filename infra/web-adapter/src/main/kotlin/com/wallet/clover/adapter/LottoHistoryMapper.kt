package com.wallet.clover.adapter

import com.wallet.clover.domain.lotto.LottoHistory
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

@Component
class LottoHistoryMapper {
    private val logger = LoggerFactory.getLogger(javaClass)

    fun toDomain(response: LottoResponse): LottoHistory? {
        if (response.returnValue != LottoResponseCode.OK) {
            logger.warn("LottoResponse returned FAIL: {}", response)
            return null
        }

        if (response.drwtNo1 == null || response.drwtNo2 == null || response.drwtNo3 == null ||
            response.drwtNo4 == null || response.drwtNo5 == null || response.drwtNo6 == null ||
            response.bnusNo == null || response.totSellamnt == null || response.firstPrzwnerCo == null ||
            response.firstWinamnt == null || response.drwNo == null || response.drwNoDate == null
        ) {
            logger.warn("LottoResponse contains null values: {}", response)
            return null
        }

        return LottoHistory(
            number1 = response.drwtNo1,
            number2 = response.drwtNo2,
            number3 = response.drwtNo3,
            number4 = response.drwtNo4,
            number5 = response.drwtNo5,
            number6 = response.drwtNo6,
            bonusNumber = response.bnusNo,
            totalRevenue = response.totSellamnt,
            countOfFirstWinners = response.firstPrzwnerCo,
            moneyOfFirstWinner = response.firstWinamnt,
            gameNumber = response.drwNo,
            drawDate = response.drwNoDate,
        )
    }
}
