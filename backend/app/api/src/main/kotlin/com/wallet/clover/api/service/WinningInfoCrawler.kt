package com.wallet.clover.api.service

import com.wallet.clover.api.client.LottoTicketClient
import com.wallet.clover.api.client.WinningInfoParser
import com.wallet.clover.api.config.LottoScrapingProperties
import com.wallet.clover.api.entity.winning.WinningInfoEntity
import com.wallet.clover.api.repository.winning.WinningInfoRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class WinningInfoCrawler(
    private val repository: WinningInfoRepository,
    private val lottoTicketClient: LottoTicketClient,
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(WinningInfoCrawler::class.java)
    private val jsonApiUrl = "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo="

    @Transactional
    suspend fun crawlWinningInfo(round: Int) {
        if (repository.existsByRound(round)) {
            logger.info("$round 회차 당첨 정보가 이미 존재합니다. 건너뜁니다.")
            return
        }

        logger.info("$round 회차 당첨 정보 수집 시작 (JSON API)")

        try {
            val url = "$jsonApiUrl$round"
            val jsonString = lottoTicketClient.getJsonByUrl(url)
            val jsonNode = objectMapper.readTree(jsonString)

            if (jsonNode.get("returnValue").asText() != "success") {
                logger.warn("$round 회차 데이터 조회 실패 (API 응답 fail)")
                return
            }

            val drawDateStr = jsonNode.get("drwNoDate").asText() // "2023-01-01"
            val drawDate = java.time.LocalDate.parse(drawDateStr)

            val entity = WinningInfoEntity(
                round = round,
                drawDate = drawDate,
                number1 = jsonNode.get("drwtNo1").asInt(),
                number2 = jsonNode.get("drwtNo2").asInt(),
                number3 = jsonNode.get("drwtNo3").asInt(),
                number4 = jsonNode.get("drwtNo4").asInt(),
                number5 = jsonNode.get("drwtNo5").asInt(),
                number6 = jsonNode.get("drwtNo6").asInt(),
                bonusNumber = jsonNode.get("bnusNo").asInt(),
                firstPrizeAmount = jsonNode.get("firstWinamnt").asLong(),
                secondPrizeAmount = 0, // JSON API 미제공
                thirdPrizeAmount = 0,  // JSON API 미제공
                fourthPrizeAmount = 0, // JSON API 미제공
                fifthPrizeAmount = 0   // JSON API 미제공
            )

            repository.save(entity)
            logger.info("$round 회차 당첨 정보 저장 성공")

        } catch (e: Exception) {
            logger.error("$round 회차 당첨 정보 수집 실패", e)
            throw e
        }
    }
}
