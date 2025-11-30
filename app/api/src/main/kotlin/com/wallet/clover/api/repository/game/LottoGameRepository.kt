package com.wallet.clover.api.repository.game

import com.wallet.clover.api.entity.game.LottoGameEntity
import kotlinx.coroutines.flow.Flow
import org.springframework.data.r2dbc.repository.Query
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository

import java.time.LocalDateTime

@Repository
interface LottoGameRepository : CoroutineCrudRepository<LottoGameEntity, Long> {
    suspend fun findByTicketId(ticketId: Long): List<LottoGameEntity>
    fun findByTicketIdIn(ticketIds: List<Long>): Flow<LottoGameEntity>
    fun findByUserId(userId: Long): Flow<LottoGameEntity>
    suspend fun deleteByUserId(userId: Long)

    @Query("SELECT COUNT(*) FROM lotto_game WHERE user_id = :userId")
    suspend fun countByUserId(userId: Long): Long

    @Query("SELECT COUNT(*) FROM lotto_game WHERE user_id = :userId AND status != 'LOSING'")
    suspend fun countWinningGamesByUserId(userId: Long): Long

    @Query("SELECT COUNT(*) > 0 FROM lotto_game WHERE user_id = :userId AND status = :status")
    suspend fun existsByUserIdAndStatus(userId: Long, status: String): Boolean

    @Query("SELECT COUNT(*) > 0 FROM lotto_game WHERE user_id = :userId AND extraction_method = :method AND status != 'LOSING'")
    suspend fun existsByUserIdAndExtractionMethodAndWinning(userId: Long, method: String): Boolean

    @Query("SELECT SUM(prize_amount) FROM lotto_game WHERE user_id = :userId")
    suspend fun sumPrizeAmountByUserId(userId: Long): Long?

    @Query("SELECT * FROM lotto_game WHERE created_at > :date AND status != 'LOSING' AND extraction_method IS NOT NULL ORDER BY created_at DESC LIMIT 10")
    fun findRecentWinningGames(date: LocalDateTime): Flow<LottoGameEntity>
}
