package com.lotto.manager.internal.endpoint.impl

import com.lotto.manager.internal.endpoint.TicketSpec
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RequestMapping("/v1/ticket")
@RestController
class TicketController : TicketSpec {
    override fun addTicket(qrCode: String, userId: Long) {
        TODO("Not yet implemented")
    }

    @GetMapping
    override fun getMyTickets(userId: String) {
        TODO("Not yet implemented")
    }
}
