package com.lotto.manager.domain.lotto.incoming

import com.lotto.manager.domain.lotto.LottoHistory

interface GetLottoHistoryListQuery {
    fun allOfThem(): List<LottoHistory>
}
