package com.lotto.manager.domain.ticket.incoming

import com.lotto.manager.domain.ticket.LottoTicket

interface SaveLottoTicketUseCase {
    fun saveScannedTicket(command: SaveScannedTicketCommand): LottoTicket
}
