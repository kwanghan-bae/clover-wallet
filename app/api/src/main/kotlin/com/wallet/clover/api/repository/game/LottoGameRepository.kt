package com.wallet.clover.api.repository.game

import com.wallet.clover.api.entity.game.LottoGameEntity
import kotlinx.coroutines.flow.Flow
import org.springframework.data.r2dbc.repository.Query
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository

@Repository
interface LottoGameRepository : CoroutineCrudRepository<LottoGameEntity, Long> {
    suspend fun findByTicketId(ticketId: Long): List<LottoGameEntity>
    fun findByUserId(userId: Long): Flow<LottoGameEntity>
    suspend fun deleteByUserId(userId: Long)

    @Query("SELECT COUNT(*) FROM lotto_game WHERE user_id = :userId")
    suspend fun countByUserId(userId: Long): Long

    @Query("SELECT SUM(prize_amount) FROM lotto_game WHERE user_id = :userId")
    suspend fun sumPrizeAmountByUserId(userId: Long): Long?
}
