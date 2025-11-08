package com.wallet.clover.api.endpoint.impl

import com.wallet.clover.api.application.TicketService
import com.wallet.clover.api.endpoint.Add
import com.wallet.clover.api.endpoint.Detail
import com.wallet.clover.api.endpoint.List
import com.wallet.clover.api.endpoint.TicketSpec
import com.wallet.clover.domain.ticket.SaveScannedTicketCommand
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RequestMapping("/v1/ticket")
@RestController
class TicketController(
    private val ticketService: TicketService,
) : TicketSpec {

    @PostMapping
    override fun add(
        @RequestBody @Valid
        input: Add.In,
    ): Add.Out {
        ticketService.saveScannedTicket(
            SaveScannedTicketCommand(
                userId = input.userId,
                url = input.qrCode,
            ),
        )
        return Add.Out.success()
    }

    @GetMapping
    override fun list(input: List.In): List.Out {
        return List.Out(
            ticketService.byUserId(input.userId),
        )
    }

    @GetMapping("/{ticketId}")
    override fun detail(
        @PathVariable ticketId: Long,
    ): Detail.Out {
        return Detail.Out(
            ticket = ticketService.byId(ticketId),
            games = ticketService.getGamesByTicketId(ticketId),
        )
    }
}
