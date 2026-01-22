package com.wallet.clover.api.dto

import com.wallet.clover.api.entity.lottospot.LottoWinningStoreEntity

abstract class LottoWinningStore {
    data class Response(
        val round: Int,
        val rank: Int,
        val storeName: String,
        val address: String,
        val method: String?
    ) {
        companion object {
            fun from(entity: LottoWinningStoreEntity): Response {
                return Response(
                    round = entity.round,
                    rank = entity.rank,
                    storeName = entity.storeName,
                    address = entity.address,
                    method = entity.method
                )
            }
        }
    }
}
