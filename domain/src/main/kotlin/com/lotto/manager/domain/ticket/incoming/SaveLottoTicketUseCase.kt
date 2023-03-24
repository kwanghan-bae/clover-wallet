package com.lotto.manager.domain.ticket.incoming

interface SaveLottoTicketUseCase {
    fun save(command: SaveLottoTicketCommand)
}
