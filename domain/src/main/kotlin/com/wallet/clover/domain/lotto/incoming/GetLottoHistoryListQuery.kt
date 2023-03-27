package com.wallet.clover.domain.lotto.incoming

import com.wallet.clover.domain.lotto.LottoHistory

interface GetLottoHistoryListQuery {
    fun allOfThem(): List<com.wallet.clover.domain.lotto.LottoHistory>
}
