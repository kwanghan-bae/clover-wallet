package com.wallet.clover.api.config

import jakarta.validation.constraints.NotBlank
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.validation.annotation.Validated

@ConfigurationProperties(prefix = "lotto.scraping")
@Validated
data class LottoScrapingProperties(
    @field:NotBlank val ordinalSelector: String = "h3 > span.key_clr1",
    @field:NotBlank val ticketStatusSelector: String = "div.bx_notice.winner strong",
    @field:NotBlank val gameRowsSelector: String = "div.list_my_number table tbody tr",
    @field:NotBlank val gameResultSelector: String = "td.result",
    @field:NotBlank val gameNumbersSelector: String = "td span.clr",
    @field:NotBlank val winRoundSelector: String = "h4 > strong",
    @field:NotBlank val winNumbersSelector: String = ".win_result .nums .win p span.ball_645",
    @field:NotBlank val bonusNumberSelector: String = ".win_result .nums .bonus p span.ball_645",
    @field:NotBlank val resultUrl: String = "https://www.dhlottery.co.kr/gameResult.do?method=byWin",
    @field:NotBlank val winningInfoDateSelector: String = "p.desc",
    @field:NotBlank val winningInfoNumSelector: String = "div.num.win span",
    @field:NotBlank val winningInfoBonusSelector: String = "div.num.bonus span",
    @field:NotBlank val winningInfoPrizeTableSelector: String = "table.tbl_data tbody tr",
    @field:NotBlank val winningStoreTableSelector: String = "table.tbl_data",
    @field:NotBlank val winningStoreEmptyMessage: String = "조회 결과가 없습니다"
)
