package com.wallet.clover.api.repository.ticket

import com.wallet.clover.api.entity.ticket.LottoTicketEntity
import com.wallet.clover.api.entity.ticket.LottoTicketStatus
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository

@Repository
interface LottoTicketRepository : CoroutineCrudRepository<LottoTicketEntity, Long> {
    suspend fun findByUserId(userId: Long): List<LottoTicketEntity>
    fun findByUserId(userId: Long, pageable: Pageable): kotlinx.coroutines.flow.Flow<LottoTicketEntity>
    suspend fun findByUrl(url: String): LottoTicketEntity?

    suspend fun findByStatus(status: LottoTicketStatus): List<LottoTicketEntity>
    suspend fun deleteByUserId(userId: Long)
    fun findByOrdinal(ordinal: Int): kotlinx.coroutines.flow.Flow<LottoTicketEntity>
    suspend fun findByUserIdAndOrdinal(userId: Long, ordinal: Int): List<LottoTicketEntity>
    suspend fun countByUserId(userId: Long): Long
}
