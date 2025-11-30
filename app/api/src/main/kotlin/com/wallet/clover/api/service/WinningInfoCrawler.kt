package com.wallet.clover.api.service

import com.wallet.clover.api.config.LottoScrapingProperties
import com.wallet.clover.api.entity.winning.WinningInfoEntity
import com.wallet.clover.api.repository.winning.WinningInfoRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.jsoup.Jsoup
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Service
class WinningInfoCrawler(
    private val repository: WinningInfoRepository,
    private val scrapingProperties: LottoScrapingProperties,
    @Value("\${external-api.dhlottery.winning-info-url}") private val winningInfoUrl: String
) {
    private val logger = LoggerFactory.getLogger(WinningInfoCrawler::class.java)

    @Transactional
    suspend fun crawlWinningInfo(round: Int) {
        if (repository.existsByRound(round)) {
            logger.info("Winning info for round $round already exists. Skipping.")
            return
        }

        logger.info("Starting crawling winning info for round $round")

        try {
            val entity = withContext(Dispatchers.IO) {
                val url = "$winningInfoUrl$round"
                val doc = Jsoup.connect(url).get()

                // 날짜 파싱
                val dateStr = doc.select(scrapingProperties.winningInfoDateSelector).text()
                // (2023년 11월 11일 추첨) -> 2023-11-11
                val dateText = dateStr.substringAfter("(").substringBefore(" 추첨").replace("년 ", "-").replace("월 ", "-").replace("일", "")
                val drawDate = LocalDate.parse(dateText, DateTimeFormatter.ISO_DATE)

                // 당첨 번호
                val numbers = doc.select(scrapingProperties.winningInfoNumSelector).map { it.text().toInt() }
                val bonusNumber = doc.select(scrapingProperties.winningInfoBonusSelector).text().toInt()

                // 당첨금 (표에서 파싱)
                val prizeTable = doc.select(scrapingProperties.winningInfoPrizeTableSelector)
                
                // 안전한 파싱을 위한 헬퍼 함수
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

                WinningInfoEntity(
                    round = round,
                    drawDate = drawDate,
                    number1 = numbers[0],
                    number2 = numbers[1],
                    number3 = numbers[2],
                    number4 = numbers[3],
                    number5 = numbers[4],
                    number6 = numbers[5],
                    bonusNumber = bonusNumber,
                    firstPrizeAmount = firstPrize,
                    secondPrizeAmount = secondPrize,
                    thirdPrizeAmount = thirdPrize,
                    fourthPrizeAmount = fourthPrize,
                    fifthPrizeAmount = fifthPrize
                )
            }

            repository.save(entity)
            logger.info("Successfully saved winning info for round $round")

        } catch (e: Exception) {
            logger.error("Failed to crawl winning info for round $round", e)
            throw e
        }
    }
}
