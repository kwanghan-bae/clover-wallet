package com.wallet.clover.api.repository.game

import com.wallet.clover.api.entity.game.LottoGameEntity
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository

@Repository
interface LottoGameRepository : CoroutineCrudRepository<LottoGameEntity, Long> {
    suspend fun findByTicketId(ticketId: Long): List<LottoGameEntity>
    suspend fun findByUserId(userId: Long): List<LottoGameEntity>
}
