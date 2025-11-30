package com.wallet.clover.api.controller

import com.wallet.clover.api.dto.LottoGame
import com.wallet.clover.api.dto.LottoTicket
import com.wallet.clover.api.exception.TicketNotFoundException
import com.wallet.clover.api.service.TicketService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/tickets")
class TicketController(
    private val ticketService: TicketService,
) {

    @GetMapping
    suspend fun getMyTickets(
        @RequestParam userId: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): List<LottoTicket.Response> {
        return ticketService.getMyTickets(userId, page, size).map { LottoTicket.Response.from(it) }
    }

    @GetMapping("/{ticketId}")
    suspend fun getTicketDetail(@PathVariable ticketId: Long): LottoTicket.DetailResponse {
        val ticket = ticketService.getTicketById(ticketId) 
            ?: throw TicketNotFoundException("Ticket not found with id: $ticketId")
        val games = ticketService.getGamesByTicketId(ticketId)
        
        return LottoTicket.DetailResponse(
            LottoTicket.Response.from(ticket),
            games.map { LottoGame.Response.from(it) }
        )
    }
}
