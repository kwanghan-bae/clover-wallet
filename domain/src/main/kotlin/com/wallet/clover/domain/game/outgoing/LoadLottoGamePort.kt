package com.wallet.clover.domain.game.outgoing

import com.wallet.clover.domain.game.LottoGame

interface LoadLottoGamePort {
    fun byId(id: Long): com.wallet.clover.domain.game.LottoGame
}
