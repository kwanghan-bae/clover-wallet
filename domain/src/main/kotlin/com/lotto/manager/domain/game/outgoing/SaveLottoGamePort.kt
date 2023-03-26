package com.lotto.manager.domain.game.outgoing

import com.lotto.manager.domain.game.LottoGame

interface SaveLottoGamePort {
    fun save(domain: LottoGame)

    fun saveAll(domains: List<LottoGame>)
}
