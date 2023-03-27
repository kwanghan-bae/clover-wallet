package com.wallet.clover.domain.lotto.incoming

import com.wallet.clover.domain.lotto.LottoHistory
import java.time.LocalDate

interface GetLottoHistoryQuery {
    fun getByDrawDate(drawDate: LocalDate): com.wallet.clover.domain.lotto.LottoHistory
}
