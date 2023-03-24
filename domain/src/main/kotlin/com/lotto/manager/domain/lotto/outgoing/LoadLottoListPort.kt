package com.lotto.manager.domain.lotto.outgoing

import com.lotto.manager.domain.lotto.LottoHistory

interface LoadLottoListPort {
    fun loadAll(): List<LottoHistory>
}
