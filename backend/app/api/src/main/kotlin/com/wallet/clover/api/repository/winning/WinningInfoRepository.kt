package com.wallet.clover.api.repository.winning

import com.wallet.clover.api.entity.winning.WinningInfoEntity
import kotlinx.coroutines.flow.Flow
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository

@Repository
interface WinningInfoRepository : CoroutineCrudRepository<WinningInfoEntity, Long> {
    suspend fun findByRound(round: Int): WinningInfoEntity?
    suspend fun existsByRound(round: Int): Boolean
    suspend fun findFirstByOrderByRoundDesc(): WinningInfoEntity?
    
    /** 모든 당첨 정보를 Flow로 반환 (통계 계산용) */
    fun findAllBy(): Flow<WinningInfoEntity>

    @org.springframework.data.r2dbc.repository.Query("SELECT round FROM winning_info")
    fun findAllRounds(): Flow<Int>
    
    /** 특정 회차 이하의 모든 당첨 정보 조회 */
    fun findByRoundLessThanEqual(round: Int): Flow<WinningInfoEntity>
}

