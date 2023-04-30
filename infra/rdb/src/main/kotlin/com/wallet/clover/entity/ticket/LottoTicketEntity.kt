package com.wallet.clover.entity.ticket

import com.wallet.clover.domain.ticket.LottoTicket
import com.wallet.clover.domain.ticket.LottoTicketStatus
import com.wallet.clover.entity.BaseEntity
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

fun LottoTicket.toEntity(): LottoTicketEntity {
    val domainId = this.id

    return LottoTicketEntity(
        userId = userId,
        url = url,
        ordinal = ordinal,
        status = status,
    ).apply {
        id = domainId
    }
}

fun LottoTicketEntity.toDomain(): LottoTicket {
    return LottoTicket(
        id = id,
        userId = userId,
        url = url,
        ordinal = ordinal,
        status = status,
        createdAt = createdAt,
        updatedAt = updatedAt,
    )
}
