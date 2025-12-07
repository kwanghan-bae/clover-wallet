package com.wallet.clover.api.client

import com.wallet.clover.api.config.LottoScrapingProperties
import com.wallet.clover.api.exception.TicketParsingException
import org.jsoup.Jsoup
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.time.format.DateTimeFormatter

data class ParsedWinningInfo(
    val drawDate: LocalDate,
    val numbers: List<Int>,
    val bonusNumber: Int,
    val firstPrize: Long,
    val secondPrize: Long,
    val thirdPrize: Long,
    val fourthPrize: Long,
    val fifthPrize: Long
)

@Component
class WinningInfoParser(
    private val properties: LottoScrapingProperties
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    fun parse(html: String): ParsedWinningInfo {
        if (html.isBlank()) {
            throw TicketParsingException("HTML 내용이 비어있습니다")
        }

        try {
            val doc = Jsoup.parse(html)

            // 날짜 파싱
            val dateStr = doc.select(properties.winningInfoDateSelector).text()
            // (2023년 11월 11일 추첨) -> 2023-11-11
            val dateText = dateStr.substringAfter("(").substringBefore(" 추첨").replace("년 ", "-").replace("월 ", "-").replace("일", "")
            val drawDate = LocalDate.parse(dateText, DateTimeFormatter.ISO_DATE)

            // 당첨 번호
            val numbers = doc.select(properties.winningInfoNumSelector).mapNotNull { it.text().toIntOrNull() }
            val bonusNumber = doc.select(properties.winningInfoBonusSelector).text().toIntOrNull()

            if (numbers.size != 6 || bonusNumber == null) {
                throw TicketParsingException("당첨 번호 파싱 실패: 번호 개수 ${numbers.size}, 보너스 $bonusNumber")
            }

            // 당첨금 (표에서 파싱)
            val prizeTable = doc.select(properties.winningInfoPrizeTableSelector)

            fun parsePrize(row: Int): Long {
                if (prizeTable.size <= row) return 0L
                val tds = prizeTable[row].select("td")
                if (tds.size < 4) return 0L
                return tds[3].text().replace(Regex("[^0-9]"), "").toLongOrNull() ?: 0L
            }

            val firstPrize = parsePrize(0)
            val secondPrize = parsePrize(1)
            val thirdPrize = parsePrize(2)
            val fourthPrize = parsePrize(3)
            val fifthPrize = parsePrize(4)

            return ParsedWinningInfo(
                drawDate = drawDate,
                numbers = numbers,
                bonusNumber = bonusNumber,
                firstPrize = firstPrize,
                secondPrize = secondPrize,
                thirdPrize = thirdPrize,
                fourthPrize = fourthPrize,
                fifthPrize = fifthPrize
            )
        } catch (e: Exception) {
            logger.error("당첨 정보 파싱 중 오류 발생", e)
            throw TicketParsingException("당첨 정보 파싱 실패", e)
        }
    }
}
