package com.wallet.clover.api.endpoint.impl

import com.wallet.clover.api.endpoint.TicketSpec
import com.wallet.clover.domain.ticket.incoming.GetLottoTicketListQuery
import com.wallet.clover.domain.ticket.incoming.GetLottoTicketQuery
import com.wallet.clover.domain.ticket.incoming.SaveLottoTicketUseCase
import com.wallet.clover.domain.ticket.incoming.SaveScannedTicketCommand
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RequestMapping("/v1/ticket")
@RestController
class TicketController(
    val saveLottoTicketUseCase: SaveLottoTicketUseCase,
    val getLottoTicketListQuery: GetLottoTicketListQuery,
    val getLottoTicketQuery: GetLottoTicketQuery,
    val getLottoGameListQuery: com.wallet.clover.domain.game.incoming.GetLottoGameListQuery,
) : TicketSpec {

    @PostMapping
    override fun add(input: TicketSpec.Add.In): TicketSpec.Add.Out {
        // TODO: url 형태 validation 필요
        saveLottoTicketUseCase.saveScannedTicket(
            SaveScannedTicketCommand(
                userId = input.userId,
                url = input.qrCode,
            ),
        )
        return TicketSpec.Add.Out.success()
    }

    @GetMapping
    override fun list(input: TicketSpec.List.In): TicketSpec.List.Out {
        return TicketSpec.List.Out(
            getLottoTicketListQuery.byUserId(input.userId),
        )
    }

    @GetMapping("/{ticketId}")
    override fun detail(
        @PathVariable ticketId: Long,
    ): TicketSpec.Detail.Out {
        return TicketSpec.Detail.Out(
            ticket = getLottoTicketQuery.byId(ticketId),
            games = getLottoGameListQuery.byTicketId(ticketId),
        )
    }
}
