package com.lotto.manager.internal.endpoint.impl

import com.lotto.manager.domain.game.incoming.GetLottoGameListQuery
import com.lotto.manager.domain.ticket.incoming.GetLottoTicketListQuery
import com.lotto.manager.domain.ticket.incoming.GetLottoTicketQuery
import com.lotto.manager.domain.ticket.incoming.SaveLottoTicketUseCase
import com.lotto.manager.domain.ticket.incoming.SaveScannedTicketCommand
import com.lotto.manager.internal.endpoint.TicketSpec
import org.springframework.web.bind.annotation.*

@RequestMapping("/v1/ticket")
@RestController
class TicketController(
    val saveLottoTicketUseCase: SaveLottoTicketUseCase,
    val getLottoTicketListQuery: GetLottoTicketListQuery,
    val getLottoTicketQuery: GetLottoTicketQuery,
    val getLottoGameListQuery: GetLottoGameListQuery
) : TicketSpec {

    @PostMapping
    override fun add(input: TicketSpec.Add.In): TicketSpec.Add.Out {
        // TODO: url 형태 validation 필요
        saveLottoTicketUseCase.saveScannedTicket(
            SaveScannedTicketCommand(
                userId = input.userId,
                url = input.qrCode
            )
        )
        return TicketSpec.Add.Out.success()
    }

    @GetMapping
    override fun list(input: TicketSpec.List.In): TicketSpec.List.Out {
        return TicketSpec.List.Out(
            getLottoTicketListQuery.byUserId(input.userId)
        )
    }

    @GetMapping("/{ticketId}")
    override fun detail(
        @PathVariable ticketId: Long
    ): TicketSpec.Detail.Out {
        return TicketSpec.Detail.Out(
            ticket = getLottoTicketQuery.byId(ticketId),
            games = getLottoGameListQuery.byTicketId(ticketId)
        )
    }
}
