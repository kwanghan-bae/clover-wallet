package com.wallet.clover.domain.lotto.outgoing

import com.wallet.clover.domain.lotto.LottoHistory

interface LoadLottoListPort {
    fun loadAll(): List<com.wallet.clover.domain.lotto.LottoHistory>
}
