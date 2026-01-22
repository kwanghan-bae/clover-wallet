package com.wallet.clover.api.repository.winning

import com.wallet.clover.api.entity.winning.WinningInfoEntity
import kotlinx.coroutines.flow.Flow
import org.springframework.data.r2dbc.repository.Query
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository

@Repository
interface WinningInfoRepository : CoroutineCrudRepository<WinningInfoEntity, Long> {
    suspend fun findByRound(round: Int): WinningInfoEntity?
    suspend fun existsByRound(round: Int): Boolean
    
    suspend fun findFirstByOrderByRoundDesc(): WinningInfoEntity?
    suspend fun findByRoundLessThanEqual(round: Int): List<WinningInfoEntity>

    @Query("SELECT round FROM winning_info")
    fun findAllRounds(): Flow<Int>
}

