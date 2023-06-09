package com.wallet.clover.repository.ticket

import com.wallet.clover.entity.ticket.LottoTicketEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface LottoTicketRepository : JpaRepository<LottoTicketEntity, Long> {
    fun findByUserIdAndUrl(userId: Long, url: String): LottoTicketEntity?
    
    fun findByUserId(userId: Long): List<LottoTicketEntity>
}
