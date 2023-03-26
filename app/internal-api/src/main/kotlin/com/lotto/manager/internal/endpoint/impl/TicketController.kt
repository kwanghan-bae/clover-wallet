package com.lotto.manager.internal.endpoint.impl

import com.lotto.manager.domain.ticket.incoming.GetLottoTicketListQuery
import com.lotto.manager.domain.ticket.incoming.SaveLottoTicketUseCase
import com.lotto.manager.domain.ticket.incoming.SaveScannedTicketCommand
import com.lotto.manager.internal.endpoint.TicketSpec
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RequestMapping("/v1/ticket")
@RestController
class TicketController(
    val saveLottoTicketUseCase: SaveLottoTicketUseCase,
    val getLottoTicketListQuery: GetLottoTicketListQuery
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
    }

    @GetMapping
    override fun list(input: TicketSpec.List.In): TicketSpec.List.Out {
        return TicketSpec.List.Out(
            getLottoTicketListQuery.byUserId(input.userId)
        )
    }
}
