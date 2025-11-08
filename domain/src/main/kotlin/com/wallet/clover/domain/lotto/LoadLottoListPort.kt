package com.wallet.clover.domain.lotto

interface LoadLottoListPort {
    fun loadAll(): List<com.wallet.clover.domain.lotto.LottoHistory>
}
