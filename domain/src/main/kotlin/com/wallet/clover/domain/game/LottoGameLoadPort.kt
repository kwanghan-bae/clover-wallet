package com.wallet.clover.domain.game

interface LottoGameLoadPort {
    fun byId(id: Long): LottoGame
}
