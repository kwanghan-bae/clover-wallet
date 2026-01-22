package com.wallet.clover.api.repository.lottospot

import com.wallet.clover.api.entity.lottospot.LottoWinningStoreEntity
import kotlinx.coroutines.flow.Flow
import org.springframework.data.r2dbc.repository.Query
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository

@Repository
interface LottoWinningStoreRepository : CoroutineCrudRepository<LottoWinningStoreEntity, Long> {
    fun findByRound(round: Int): Flow<LottoWinningStoreEntity>
    suspend fun existsByRound(round: Int): Boolean
    
    fun findByStoreNameOrderByRoundDesc(storeName: String): Flow<LottoWinningStoreEntity>

    @Query("SELECT DISTINCT round FROM lotto_winning_store")
    fun findAllRounds(): Flow<Int>
}
