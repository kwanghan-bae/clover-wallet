package com.wallet.clover.api.entity.ticket

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class LottoTicketStatusTest {

    @Test
    fun `valueOfHtmlValue should map HTML strings correctly`() {
        assertEquals(LottoTicketStatus.WINNING, LottoTicketStatus.valueOfHtmlValue("당첨"))
        assertEquals(LottoTicketStatus.LOSING, LottoTicketStatus.valueOfHtmlValue("낙첨"))
        assertEquals(LottoTicketStatus.STASHED, LottoTicketStatus.valueOfHtmlValue("발표전"))
        assertEquals(LottoTicketStatus.PENDING, LottoTicketStatus.valueOfHtmlValue("대기중"))
        assertEquals(LottoTicketStatus.PENDING, LottoTicketStatus.valueOfHtmlValue("알수없음")) // Default case
    }
}
