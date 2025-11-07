package com.wallet.clover.api.application

import com.wallet.clover.adapter.LottoHistoryMapper
import com.wallet.clover.adapter.LottoHistoryWebClient
import com.wallet.clover.adapter.LottoResponse
import com.wallet.clover.adapter.LottoResponseCode
import com.wallet.clover.domain.lotto.LottoHistory
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.shouldBe
import io.mockk.coEvery
import io.mockk.mockk
import reactor.core.publisher.Mono
import java.time.LocalDate

class StatisticsCalculatorTest : ShouldSpec(
    {
        val client = mockk<LottoHistoryWebClient>()
        val mapper = mockk<LottoHistoryMapper>()
        val sut = StatisticsCalculator(client, mapper)

        context("calculate") {
            should("return correct statistics") { // given
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

                coEvery { client.getByGameNumber(any()) } answers {
                    val gameNumber = it.invocation.args[0] as Int
                    Mono.just(lottoResponse.copy(drwNo = gameNumber))
                }
                coEvery { mapper.toDomain(any()) } answers {
                    val response = it.invocation.args[0] as LottoResponse
                    LottoHistory(
                        gameNumber = response.drwNo!!,
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
                }

                // when
                val statistics = sut.calculate()

                // then
                statistics.dateCounter[1]!![1]!!.toLong() shouldBe 1065
                statistics.monthCounter[1]!![1]!!.toLong() shouldBe 1065
                statistics.oddEvenCounter["odd"]!![1]!!.toLong() shouldBe 533 // 1065 / 2 (rounded up)
                statistics.oddEvenCounter["even"]!![1]!!.toLong() shouldBe 532 // 1065 / 2 (rounded down)
            }
        }
    },
)
