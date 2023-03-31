package com.wallet.clover.entity.game

import com.wallet.clover.domain.game.LottoGame
import com.wallet.clover.domain.game.LottoGameStatus
import com.wallet.clover.entity.BaseEntity
import com.wallet.clover.entity.ticket.LottoTicketEntity
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table

@Entity
@Table(name = "lotto_game")
class LottoGameEntity(
    val userId: Long,
    val ticketId: Long,
    val status: LottoGameStatus,
    val number1: Int,
    val number2: Int,
    val number3: Int,
    val number4: Int,
    val number5: Int,
    val number6: Int,
) : BaseEntity() {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(columnDefinition = "long", name = "lotto_ticket_id")
    lateinit var lottoTicket: LottoTicketEntity
}

fun LottoGame.toEntity(): LottoGameEntity {
    val domainId = this.id

    return LottoGameEntity(
        userId = userId,
        ticketId = ticketId,
        status = status,
        number1 = number1,
        number2 = number2,
        number3 = number3,
        number4 = number4,
        number5 = number5,
        number6 = number6,
    ).apply {
        id = domainId
    }
}

fun LottoGameEntity.toDomain() = LottoGame(
    id = id,
    userId = userId,
    ticketId = ticketId,
    status = status,
    number1 = number1,
    number2 = number2,
    number3 = number3,
    number4 = number4,
    number5 = number5,
    number6 = number6,
)
