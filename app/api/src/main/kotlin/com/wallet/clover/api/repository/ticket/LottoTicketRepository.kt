package com.wallet.clover.api.repository.ticket

import com.wallet.clover.api.entity.ticket.LottoTicketEntity
import com.wallet.clover.api.entity.ticket.LottoTicketStatus
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository

@Repository
interface LottoTicketRepository : CoroutineCrudRepository<LottoTicketEntity, Long> {
    suspend fun findByUserId(userId: Long): List<LottoTicketEntity>
    suspend fun findByUrl(url: String): LottoTicketEntity?

    suspend fun findByStatus(status: LottoTicketStatus): List<LottoTicketEntity>
    suspend fun deleteByUserId(userId: Long)
    suspend fun findByOrdinal(ordinal: Int): List<LottoTicketEntity>
}
