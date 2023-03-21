package com.lotto.manager.internal.endpoint

interface TicketSpec {
    fun addBarcode(barcode: String)
    
    fun getMyTickets(userId: String)
}
