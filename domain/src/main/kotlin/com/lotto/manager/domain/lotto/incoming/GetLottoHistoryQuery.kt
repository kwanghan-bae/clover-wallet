package com.lotto.manager.domain.lotto.incoming

import com.lotto.manager.domain.lotto.LottoHistory
import java.time.LocalDate

interface GetLottoHistoryQuery {
    fun getByDrawDate(drawDate: LocalDate): LottoHistory
}
