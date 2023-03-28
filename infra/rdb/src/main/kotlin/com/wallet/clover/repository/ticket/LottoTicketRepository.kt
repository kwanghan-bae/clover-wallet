package com.wallet.clover.repository.ticket

import com.wallet.clover.entity.ticket.LottoTicketEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface LottoTicketRepository : JpaRepository<LottoTicketEntity, Long>
