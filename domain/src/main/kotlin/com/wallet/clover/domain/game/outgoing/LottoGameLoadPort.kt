package com.wallet.clover.domain.game.outgoing

import com.wallet.clover.domain.game.LottoGame

interface LottoGameLoadPort {
    fun byId(id: Long): LottoGame
}
