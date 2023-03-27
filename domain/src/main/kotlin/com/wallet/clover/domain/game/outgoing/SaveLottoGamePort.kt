package com.wallet.clover.domain.game.outgoing

import com.wallet.clover.domain.game.LottoGame

interface SaveLottoGamePort {
    fun save(domain: com.wallet.clover.domain.game.LottoGame)

    fun saveAll(domains: List<com.wallet.clover.domain.game.LottoGame>)
}
