package com.wallet.clover.api.service

import com.wallet.clover.api.client.LottoTicketClient
import com.wallet.clover.api.client.WinningInfoParser
import com.wallet.clover.api.config.LottoScrapingProperties
import com.wallet.clover.api.entity.winning.WinningInfoEntity
import com.wallet.clover.api.repository.winning.WinningInfoRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class WinningInfoCrawler(
    private val repository: WinningInfoRepository,
    private val lottoTicketClient: LottoTicketClient,
    private val winningInfoParser: WinningInfoParser,
    @Value("\${external-api.dhlottery.winning-info-url}") private val winningInfoUrl: String
) {
    private val logger = LoggerFactory.getLogger(WinningInfoCrawler::class.java)


    @Transactional
    suspend fun crawlWinningInfo(round: Int) {
        if (repository.existsByRound(round)) {
            logger.info("$round 회차 당첨 정보가 이미 존재합니다. 건너뜁니다.")
            return
        }

        logger.info("$round 회차 당첨 정보 크롤링 시작")

        try {
            val url = "$winningInfoUrl$round"
            val html = lottoTicketClient.getHtmlByUrl(url)
            val parsedInfo = winningInfoParser.parse(html)

            val entity = WinningInfoEntity(
                round = round,
                drawDate = parsedInfo.drawDate,
                number1 = parsedInfo.numbers[0],
                number2 = parsedInfo.numbers[1],
                number3 = parsedInfo.numbers[2],
                number4 = parsedInfo.numbers[3],
                number5 = parsedInfo.numbers[4],
                number6 = parsedInfo.numbers[5],
                bonusNumber = parsedInfo.bonusNumber,
                firstPrizeAmount = parsedInfo.firstPrize,
                secondPrizeAmount = parsedInfo.secondPrize,
                thirdPrizeAmount = parsedInfo.thirdPrize,
                fourthPrizeAmount = parsedInfo.fourthPrize,
                fifthPrizeAmount = parsedInfo.fifthPrize
            )

            repository.save(entity)
            logger.info("$round 회차 당첨 정보 저장 성공")

        } catch (e: Exception) {
            logger.error("$round 회차 당첨 정보 크롤링 실패", e)
            throw e
        }
    }
}
