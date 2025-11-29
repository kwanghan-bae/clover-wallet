package com.wallet.clover.api.service

import com.wallet.clover.api.adapter.LottoHistoryMapper
import com.wallet.clover.api.adapter.LottoHistoryWebClient
import com.wallet.clover.api.adapter.LottoResponse
import com.wallet.clover.api.adapter.LottoResponseCode
import com.wallet.clover.api.domain.lotto.LottoHistory
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import reactor.core.publisher.Mono
import java.time.LocalDate

class StatisticsCalculatorTest : ShouldSpec(
    {
        val client = mockk<LottoHistoryWebClient>()
        val mapper = mockk<LottoHistoryMapper>()
        val sut = StatisticsCalculator(client, mapper)

        context("calculate") {
            should("return correct statistics") {
                runTest {
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

                    every { client.getByGameNumber(any()) } answers {
                        val gameNumber = it.invocation.args[0] as Int
                        Mono.just(lottoResponse.copy(drwNo = gameNumber))
                    }
                    every { mapper.toDomain(any()) } answers {
                        val response = it.invocation.args[0] as LottoResponse
                        lottoHistory.copy(gameNumber = response.drwNo!!)
                    }

                    // when
                    val statistics = sut.calculate()

                    // then
                    statistics.dateCounter[1]!![1]!!.toLong() shouldBe 1065
                    statistics.monthCounter[1]!![1]!!.toLong() shouldBe 1065

                    // 1부터 1065까지의 숫자 중 홀수는 533개, 짝수는 532개
                    val oddGames = (1..1065).count { it % 2 != 0 }
                    val evenGames = (1..1065).count { it % 2 == 0 }

                    // 각 숫자는 모든 게임에서 한 번씩 등장하도록 모의 설정됨
                    statistics.oddEvenCounter["odd"]!![1]!!.toLong() shouldBe oddGames
                    statistics.oddEvenCounter["even"]!![1]!!.toLong() shouldBe evenGames
                }
            }
        }
    },
)
