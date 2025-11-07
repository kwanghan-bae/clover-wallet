package com.wallet.clover.domain.lotto.outgoing

import com.wallet.clover.domain.lotto.LottoHistory

interface LoadLottoHistoryPort {
    suspend fun loadByGameNumber(gameNumber: Int): LottoHistory?
}
