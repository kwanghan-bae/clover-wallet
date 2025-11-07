package com.wallet.clover.domain.lotto.outgoing

import com.wallet.clover.domain.lotto.LottoHistory
import java.time.LocalDate

interface LoadLottoHistoryPort {
    suspend fun loadByDrawDate(drawDate: LocalDate): LottoHistory?
}
