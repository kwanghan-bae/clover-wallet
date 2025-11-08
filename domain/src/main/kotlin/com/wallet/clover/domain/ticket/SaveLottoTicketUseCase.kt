package com.wallet.clover.domain.ticket

interface SaveLottoTicketUseCase {
    fun saveScannedTicket(command: SaveScannedTicketCommand): LottoTicket
}
