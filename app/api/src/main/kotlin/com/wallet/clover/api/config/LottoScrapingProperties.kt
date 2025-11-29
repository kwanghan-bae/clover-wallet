package com.wallet.clover.api.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "lotto.scraping")
data class LottoScrapingProperties(
    val ordinalSelector: String = "h3 > span.key_clr1",
    val ticketStatusSelector: String = "div.bx_notice.winner strong",
    val gameRowsSelector: String = "div.list_my_number table tbody tr",
    val gameResultSelector: String = "td.result",
    val gameNumbersSelector: String = "td span.clr",
    val winRoundSelector: String = "h4 > strong",
    val winNumbersSelector: String = ".win_result .nums .win p span.ball_645",
    val bonusNumberSelector: String = ".win_result .nums .bonus p span.ball_645"
)
