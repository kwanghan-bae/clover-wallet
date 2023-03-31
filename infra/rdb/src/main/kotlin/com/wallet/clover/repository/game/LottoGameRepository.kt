package com.wallet.clover.repository.game

import com.wallet.clover.entity.game.LottoGameEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface LottoGameRepository : JpaRepository<LottoGameEntity, Long> {
    fun findAllByUserId(userId: Long): List<LottoGameEntity>

    fun findAllByTicketId(ticketId: Long): List<LottoGameEntity>
}
