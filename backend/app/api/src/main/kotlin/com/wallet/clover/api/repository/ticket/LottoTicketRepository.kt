package com.wallet.clover.api.repository.ticket

import com.wallet.clover.api.entity.ticket.LottoTicketEntity
import com.wallet.clover.api.entity.ticket.LottoTicketStatus
import kotlinx.coroutines.flow.Flow
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository

@Repository
interface LottoTicketRepository : CoroutineCrudRepository<LottoTicketEntity, Long> {
    fun findByUserId(userId: Long): Flow<LottoTicketEntity>
    fun findByUserId(userId: Long, pageable: Pageable): Flow<LottoTicketEntity>
    suspend fun findByUrl(url: String): LottoTicketEntity?

    fun findByStatus(status: LottoTicketStatus): Flow<LottoTicketEntity>
    suspend fun deleteByUserId(userId: Long)
    fun findByOrdinal(ordinal: Int): Flow<LottoTicketEntity>
    fun findByUserIdAndOrdinal(userId: Long, ordinal: Int): Flow<LottoTicketEntity>
    suspend fun countByUserId(userId: Long): Long
}