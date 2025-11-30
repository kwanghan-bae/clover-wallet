package com.wallet.clover.api.service

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

                // 날짜 파싱 (2023년 11월 25일 추첨)
                val dateText = doc.select("p.desc").text().replace(Regex(".*?\\((.*?)\\s추첨\\).*"), "$1")
                val drawDate = LocalDate.parse(dateText, DateTimeFormatter.ofPattern("yyyy년 MM월 dd일"))

                // 당첨 번호
                val numbers = doc.select("div.num.win span").map { it.text().toInt() }
                val bonusNumber = doc.select("div.num.bonus span").text().toInt()

                // 당첨금 (표에서 파싱)
                val prizeTable = doc.select("table.tbl_data tbody tr")
                
                // 1등 당첨금
                val firstPrizeStr = prizeTable[0].select("td")[3].text().replace(Regex("[^0-9]"), "")
                val firstPrize = firstPrizeStr.toLong()

                // 2등 당첨금
                val secondPrizeStr = prizeTable[1].select("td")[3].text().replace(Regex("[^0-9]"), "")
                val secondPrize = secondPrizeStr.toLong()

                // 3등 당첨금
                val thirdPrizeStr = prizeTable[2].select("td")[3].text().replace(Regex("[^0-9]"), "")
                val thirdPrize = thirdPrizeStr.toLong()

                // 4등, 5등은 고정일 수 있지만 크롤링 (보통 50,000 / 5,000)
                val fourthPrizeStr = prizeTable[3].select("td")[3].text().replace(Regex("[^0-9]"), "")
                val fourthPrize = fourthPrizeStr.toLong()

                val fifthPrizeStr = prizeTable[4].select("td")[3].text().replace(Regex("[^0-9]"), "")
                val fifthPrize = fifthPrizeStr.toLong()

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
