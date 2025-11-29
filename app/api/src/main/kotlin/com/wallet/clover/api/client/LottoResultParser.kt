package com.wallet.clover.api.client

import com.wallet.clover.api.config.LottoScrapingProperties
import org.jsoup.Jsoup
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

data class ParsedLottoResult(
    val round: Int,
    val winningNumbers: List<Int>,
    val bonusNumber: Int
)

@Component
class LottoResultParser(
    private val properties: LottoScrapingProperties
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    fun parse(html: String): ParsedLottoResult {
        if (html.isBlank()) {
            throw TicketParsingException("HTML content is empty")
        }

        val doc = Jsoup.parse(html)

        val roundText = doc.select(properties.winRoundSelector).first()?.text()?.replace(Regex("[^0-9]"), "")
        val winNumbers = doc.select(properties.winNumbersSelector)
            .mapNotNull { it.text().trim().toIntOrNull() }
        val bonusNumber = doc.select(properties.bonusNumberSelector).first()?.text()?.trim()?.toIntOrNull()

        if (roundText.isNullOrBlank() || winNumbers.size != 6 || bonusNumber == null) {
            logger.error("Failed to parse lotto result. Round: $roundText, Numbers: $winNumbers, Bonus: $bonusNumber")
            throw TicketParsingException("당첨 번호를 파싱하는 데 실패했습니다.")
        }

        return ParsedLottoResult(
            round = roundText.toInt(),
            winningNumbers = winNumbers,
            bonusNumber = bonusNumber
        )
    }
}
