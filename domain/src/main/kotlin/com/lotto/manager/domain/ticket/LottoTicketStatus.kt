package com.lotto.manager.domain.ticket

import com.fasterxml.jackson.annotation.JsonCreator

enum class LottoTicketStatus(val htmlValue: String) {
    STASHED("발표전"),
    LOSING("낙첨"),
    WINNING("당첨");
    companion object {
        @JvmStatic
        @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
        fun valueOfHtmlValue(htmlValue: String): LottoTicketStatus {
            return values().firstOrNull { it.htmlValue == htmlValue } ?: STASHED
        }
    }
}
