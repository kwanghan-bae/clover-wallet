package com.wallet.clover.api.controller

import com.wallet.clover.api.dto.LottoGameResponse
import com.wallet.clover.api.dto.LottoTicketResponse
import com.wallet.clover.api.dto.TicketDetailResponse
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
    suspend fun getMyTickets(@RequestParam userId: Long): List<LottoTicketResponse> {
        return ticketService.getMyTickets(userId).map { LottoTicketResponse.from(it) }
    }

    @GetMapping("/{ticketId}")
    suspend fun getTicketDetail(@PathVariable ticketId: Long): TicketDetailResponse {
        val ticket = ticketService.getTicketById(ticketId) 
            ?: throw IllegalArgumentException("Ticket not found")
        val games = ticketService.getGamesByTicketId(ticketId)
        
        return TicketDetailResponse(
            LottoTicketResponse.from(ticket),
            games.map { LottoGameResponse.from(it) }
        )
    }
}
