package com.wallet.clover.entity.ticket

import com.wallet.clover.entity.BaseEntity
import com.wallet.clover.entity.ticket.LottoTicketStatus
import com.wallet.clover.entity.game.LottoGameEntity
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.OneToMany
import jakarta.persistence.Table

@Entity
@Table(name = "lotto_ticket")
class LottoTicketEntity(
    val userId: Long,
    val url: String,
    val ordinal: Int,
    val status: LottoTicketStatus,
) : BaseEntity() {

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "lottoTicket")
    lateinit var games: Set<LottoGameEntity>
}


