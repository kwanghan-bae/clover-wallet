package com.wallet.clover.api.service

import com.wallet.clover.api.entity.lottospot.LottoWinningStoreEntity
import com.wallet.clover.api.repository.lottospot.LottoWinningStoreRepository
import org.springframework.stereotype.Service

@Service
class LottoWinningStoreService(
    private val crawler: LottoWinningStoreCrawler,
    private val repository: LottoWinningStoreRepository
) {
    suspend fun crawlWinningStores(round: Int) {
        crawler.crawlWinningStores(round)
    }

    suspend fun getWinningStores(round: Int): List<LottoWinningStoreEntity> {
        return repository.findByRound(round)
    }
}
