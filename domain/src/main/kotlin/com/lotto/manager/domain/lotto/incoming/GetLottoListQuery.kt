package com.lotto.manager.domain.lotto.incoming

import com.lotto.manager.domain.lotto.Lotto

interface GetLottoListQuery {
    fun allOfThem(): List<Lotto>
}