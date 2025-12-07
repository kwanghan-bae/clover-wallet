package com.wallet.clover.api.controller

import com.wallet.clover.api.common.CommonResponse
import com.wallet.clover.api.common.PageResponse
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
    ): CommonResponse<PageResponse<LottoTicket.Response>> {
        val ticketsPage = ticketService.getMyTickets(userId, page, size)
        val responsePage = PageResponse(
            content = ticketsPage.content.map { LottoTicket.Response.from(it) },
            page = ticketsPage.page,
            size = ticketsPage.size,
            totalElements = ticketsPage.totalElements,
            totalPages = ticketsPage.totalPages
        )
        return CommonResponse.success(responsePage)
    }

    @GetMapping("/{ticketId}")
    suspend fun getTicketDetail(@PathVariable ticketId: Long): CommonResponse<LottoTicket.DetailResponse> {
        val ticket = ticketService.getTicketById(ticketId) 
            ?: throw TicketNotFoundException("Ticket not found with id: ")
        val games = ticketService.getGamesByTicketId(ticketId)
        
        return CommonResponse.success(LottoTicket.DetailResponse(
            LottoTicket.Response.from(ticket),
            games.map { LottoGame.Response.from(it) }
        ))
    }
}
