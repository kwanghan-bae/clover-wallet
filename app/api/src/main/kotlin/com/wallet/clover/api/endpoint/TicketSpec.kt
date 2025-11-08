package com.wallet.clover.api.endpoint

interface TicketSpec {
    fun add(input: Add.In): Add.Out

    fun list(input: List.In): List.Out

    fun detail(ticketId: Long): Detail.Out
}
