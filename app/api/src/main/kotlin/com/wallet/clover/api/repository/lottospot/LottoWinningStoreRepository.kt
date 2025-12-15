package com.wallet.clover.api.repository.lottospot

import com.wallet.clover.api.entity.lottospot.LottoWinningStoreEntity
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository

@Repository
interface LottoWinningStoreRepository : CoroutineCrudRepository<LottoWinningStoreEntity, Long> {
    suspend fun findByRound(round: Int): List<LottoWinningStoreEntity>
    suspend fun existsByRound(round: Int): Boolean

    @org.springframework.data.r2dbc.repository.Query("SELECT DISTINCT round FROM lotto_winning_store")
    fun findAllRounds(): Flow<Int>
}
