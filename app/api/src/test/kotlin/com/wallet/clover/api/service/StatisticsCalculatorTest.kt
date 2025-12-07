package com.wallet.clover.api.service

import com.wallet.clover.api.client.LottoHistoryMapper
import com.wallet.clover.api.client.LottoHistoryWebClient
import com.wallet.clover.api.client.LottoResponse
import com.wallet.clover.api.client.LottoResponseCode
import com.wallet.clover.api.domain.lotto.LottoHistory
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.shouldBe
import io.mockk.coEvery
import io.mockk.every
import io.mockk.mockk
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import java.time.LocalDate

class StatisticsCalculatorTest : ShouldSpec(
    {
        val client = mockk<LottoHistoryWebClient>()
        val mapper = mockk<LottoHistoryMapper>()
        val dispatcher = UnconfinedTestDispatcher()
        val sut = StatisticsCalculator(client, mapper, dispatcher)

        context("calculate") {
            should("return correct statistics") {
                runTest(dispatcher) {
                    // given
                    val lottoResponse = LottoResponse(
                        returnValue = LottoResponseCode.OK,
                        drwNo = 1,
                        drwNoDate = LocalDate.of(2023, 1, 1),
                        totSellamnt = 1000,
                        firstAccumamnt = 1000,
                        firstWinamnt = 1000,
                        firstPrzwnerCo = 1,
                        drwtNo1 = 1,
                        drwtNo2 = 2,
                        drwtNo3 = 3,
                        drwtNo4 = 4,
                        drwtNo5 = 5,
                        drwtNo6 = 6,
                        bnusNo = 7,
                    )
                    val lottoHistory = LottoHistory(
                        gameNumber = 1,
                        drawDate = LocalDate.of(2023, 1, 1),
                        number1 = 1,
                        number2 = 2,
                        number3 = 3,
                        number4 = 4,
                        number5 = 5,
                        number6 = 6,
                        bonusNumber = 7,
                        totalRevenue = 1000,
                        countOfFirstWinners = 1,
                        moneyOfFirstWinner = 1000,
                    )

                    coEvery { client.getByGameNumber(1) } returns lottoResponse
                    every { mapper.toDomain(lottoResponse) } returns lottoHistory

                    // when
                    val statistics = sut.calculate(1)

                    // then
                    statistics.dateCounter[1]!![1]!! shouldBe 1L
                    statistics.monthCounter[1]!![1]!! shouldBe 1L

                    // 1부터 1까지의 숫자 중 홀수는 1개, 짝수는 0개
                    val oddGames = 1L
                    val evenGames = 0L

                    // 각 숫자는 모든 게임에서 한 번씩 등장하도록 모의 설정됨
                    statistics.oddEvenCounter["odd"]!![1]!! shouldBe oddGames
                    statistics.oddEvenCounter["even"]!![1]!! shouldBe evenGames
                }
            }
        }
    },
)
