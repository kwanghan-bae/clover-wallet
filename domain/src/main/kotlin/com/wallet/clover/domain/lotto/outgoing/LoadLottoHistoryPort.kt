package com.wallet.clover.domain.lotto.outgoing

import com.wallet.clover.domain.lotto.LottoHistory
import java.time.LocalDate

interface LoadLottoHistoryPort {
    fun loadByDrawDate(drawDate: LocalDate): com.wallet.clover.domain.lotto.LottoHistory?

    fun loadGameNumberByPurchaseDate(purchaseDate: LocalDate): Long

    fun loadStashedTicket(): String
}
