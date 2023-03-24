package com.lotto.manager.internal.endpoint

interface TicketSpec {
    fun addTicket(qrCode: String, userId: Long)
    
    fun getMyTickets(userId: String)
}
