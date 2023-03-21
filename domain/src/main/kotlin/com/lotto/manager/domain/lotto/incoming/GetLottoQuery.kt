package com.lotto.manager.domain.lotto.incoming

import com.lotto.manager.domain.lotto.Lotto
import java.time.LocalDate

interface GetLottoQuery {
    fun getByDrawDate(drawDate: LocalDate): Lotto
}
