package com.lotto.manager.domain.lotto.outgoing

import com.lotto.manager.domain.lotto.Lotto

interface LoadLottoListPort {
    fun loadAll(): List<Lotto>
}