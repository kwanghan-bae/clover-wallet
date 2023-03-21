package com.lotto.manager.domain.lotto.outgoing

import com.lotto.manager.domain.lotto.Lotto

interface SaveLottoPort {
    fun save(domain: Lotto)
}
