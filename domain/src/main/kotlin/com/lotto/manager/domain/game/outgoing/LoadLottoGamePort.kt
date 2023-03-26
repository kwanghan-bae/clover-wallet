package com.lotto.manager.domain.game.outgoing

import com.lotto.manager.domain.game.LottoGame

interface LoadLottoGamePort {
    fun byId(id: Long): LottoGame
}
