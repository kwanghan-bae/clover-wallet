package com.wallet.clover.domain.game.outgoing

interface LottoGameSavePort {
    fun save(domain: com.wallet.clover.domain.game.LottoGame)

    fun saveAll(domains: List<com.wallet.clover.domain.game.LottoGame>)
}
