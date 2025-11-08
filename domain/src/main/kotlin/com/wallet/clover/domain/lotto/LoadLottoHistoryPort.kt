package com.wallet.clover.domain.lotto

interface LoadLottoHistoryPort {
    suspend fun loadByGameNumber(gameNumber: Int): LottoHistory?
}
