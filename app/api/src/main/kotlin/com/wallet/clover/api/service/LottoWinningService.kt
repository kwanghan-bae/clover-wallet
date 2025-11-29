package com.wallet.clover.api.service

import com.wallet.clover.api.client.LottoTicketClient
import com.wallet.clover.api.entity.game.LottoGameStatus
import com.wallet.clover.api.entity.ticket.LottoTicketStatus
import com.wallet.clover.api.repository.game.LottoGameRepository
import com.wallet.clover.api.repository.ticket.LottoTicketRepository
import com.wallet.clover.api.repository.user.UserRepository
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.runBlocking
import org.jsoup.Jsoup
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service

@Service
class LottoWinningService(
    private val ticketRepository: LottoTicketRepository,
    private val gameRepository: LottoGameRepository,
    private val userRepository: UserRepository,
    private val winningChecker: WinningChecker,
    private val fcmService: FcmService,
    private val lottoTicketClient: LottoTicketClient
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    /**
     * 매주 토요일 오후 9시에 실행
     * KST 기준: 매주 토요일 21:00
     */
    @Scheduled(cron = "0 0 21 * * SAT", zone = "Asia/Seoul")
    fun checkWeeklyWinning() = runBlocking {
        logger.info("Starting weekly lotto winning check...")
        
        try {
            // 1. 최신 회차 당첨 번호 스크래핑
            val winningNumbers = scrapeLatestWinningNumbers()
            logger.info("Scraped winning numbers: $winningNumbers")

            // 2. 모든 STASHED(발표전) 상태 티켓 조회
            val pendingTickets = ticketRepository.findByStatus(LottoTicketStatus.STASHED)
            logger.info("Found ${pendingTickets.size} pending tickets")

            // 3. 각 티켓의 게임들을 검사
            pendingTickets.forEach { ticket ->
                val games = gameRepository.findByTicketId(ticket.id!!)
                var hasWinning = false

                games.forEach { game ->
                    val userNumbers = listOf(
                        game.number1, game.number2, game.number3,
                        game.number4, game.number5, game.number6
                    )
                    
                    val rank = winningChecker.checkWinning(userNumbers, winningNumbers)
                    
                    // 게임 상태 업데이트
                    val newStatus = when (rank) {
                        WinningChecker.WinningRank.FIRST -> LottoGameStatus.WINNING_1
                        WinningChecker.WinningRank.SECOND -> LottoGameStatus.WINNING_2
                        WinningChecker.WinningRank.THIRD -> LottoGameStatus.WINNING_3
                        WinningChecker.WinningRank.FOURTH -> LottoGameStatus.WINNING_4
                        WinningChecker.WinningRank.FIFTH -> LottoGameStatus.WINNING_5
                        WinningChecker.WinningRank.NONE -> LottoGameStatus.LOSING
                    }
                    
                    if (rank != WinningChecker.WinningRank.NONE) {
                        hasWinning = true
                    }
                    
                    gameRepository.save(game.copy(status = newStatus))
                    
                    // 당첨된 경우 푸시 알림 전송
                    if (rank != WinningChecker.WinningRank.NONE) {
                        val user = userRepository.findById(ticket.userId)
                        user?.fcmToken?.let { token ->
                            val message = winningChecker.getWinningMessage(rank, userNumbers)
                            fcmService.sendToUser(token, "로또 당첨!", message)
                        }
                    }
                }

                // 티켓 상태 업데이트
                val newTicketStatus = if (hasWinning) {
                    LottoTicketStatus.WINNING
                } else {
                    LottoTicketStatus.LOSING
                }
                ticketRepository.save(ticket.copy(status = newTicketStatus))
            }

            logger.info("Weekly lotto winning check completed successfully")
        } catch (e: Exception) {
            logger.error("Error during weekly winning check", e)
        }
    }

    /**
     * 최신 회차 당첨 번호 스크래핑
     * 나눔로또 공식 사이트에서 당첨 번호를 가져옵니다.
     */
    private suspend fun scrapeLatestWinningNumbers(): WinningChecker.WinningNumbers {
        // 나눔로또 공식 당첨 번호 페이지
        val html = lottoTicketClient.getHtmlByUrl("https://www.dhlottery.co.kr/gameResult.do?method=byWin")
        val doc = Jsoup.parse(html)

        // 당첨 번호 파싱
        val numbers = doc.select(".nums .num.win").map { it.text().toInt() }
        val bonusNumber = doc.select(".nums .num.bonus").first()?.text()?.toInt()
            ?: throw IllegalStateException("보너스 번호를 찾을 수 없습니다")

        return WinningChecker.WinningNumbers(
            numbers = numbers,
            bonusNumber = bonusNumber
        )
    }

    /**
     * 테스트용: 수동 실행 메서드
     */
    suspend fun checkWinningManually() {
        checkWeeklyWinning()
    }
}
