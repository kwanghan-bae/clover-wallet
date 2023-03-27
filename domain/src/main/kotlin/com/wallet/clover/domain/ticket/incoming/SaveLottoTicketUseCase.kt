package com.wallet.clover.domain.ticket.incoming

import com.wallet.clover.domain.ticket.LottoTicket

interface SaveLottoTicketUseCase {
    fun saveScannedTicket(command: SaveScannedTicketCommand): com.wallet.clover.domain.ticket.LottoTicket
}
