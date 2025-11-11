package com.wallet.clover.api.application

import com.wallet.clover.api.endpoint.LottoCheck
import org.springframework.stereotype.Service

@Service
class LottoService {

    fun checkWinnings(): LottoCheck.Out {
        // TODO: Implement actual lottery scraping and winning comparison logic here
        // For now, return a dummy response
        return LottoCheck.Out(
            message = "로또 당첨 확인 기능은 아직 구현되지 않았습니다.",
            winningNumbers = listOf(1, 2, 3, 4, 5, 6), // Dummy winning numbers
            userWinningTickets = listOf(
                LottoCheck.UserWinningTicket(
                    round = 1000,
                    userNumbers = listOf(1, 2, 3, 10, 11, 12),
                    matchedNumbers = listOf(1, 2, 3),
                    rank = "5등"
                )
            )
        )
    }
}
