package com.wallet.clover.api.repository.winning

import com.wallet.clover.api.entity.winning.WinningInfoEntity
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository

@Repository
interface WinningInfoRepository : CoroutineCrudRepository<WinningInfoEntity, Long> {
    suspend fun findByRound(round: Int): WinningInfoEntity?
    suspend fun existsByRound(round: Int): Boolean
    suspend fun findFirstByOrderByRoundDesc(): WinningInfoEntity?
}
