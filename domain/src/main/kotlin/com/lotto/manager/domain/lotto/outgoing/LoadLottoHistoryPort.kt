package com.lotto.manager.domain.lotto.outgoing

import com.lotto.manager.domain.lotto.LottoHistory
import java.time.LocalDate

interface LoadLottoHistoryPort {
    fun loadByDrawDate(drawDate: LocalDate): LottoHistory?

    fun loadGameNumberByPurchaseDate(purchaseDate: LocalDate): Long

    fun loadStashedTicket(): String
}
