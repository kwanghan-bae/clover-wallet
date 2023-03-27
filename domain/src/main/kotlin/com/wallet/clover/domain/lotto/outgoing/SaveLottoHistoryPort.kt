package com.wallet.clover.domain.lotto.outgoing

import com.wallet.clover.domain.lotto.LottoHistory

interface SaveLottoHistoryPort {
    fun save(domain: com.wallet.clover.domain.lotto.LottoHistory)
}
