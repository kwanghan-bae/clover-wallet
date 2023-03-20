package com.lotto.manager.domain.lotto.outgoing

import com.lotto.manager.domain.lotto.Lotto
import java.time.LocalDate

interface LoadLottoPort {
    fun loadByDrawDate(drawDate: LocalDate): Lotto?

    fun loadGameNumberByPurchaseDate(purchaseDate: LocalDate): Long
}