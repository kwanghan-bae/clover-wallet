package com.lotto.manager.domain.lotto.outgoing

import com.lotto.manager.domain.lotto.LottoHistory

interface SaveLottoHistoryPort {
    fun save(domain: LottoHistory)
}
