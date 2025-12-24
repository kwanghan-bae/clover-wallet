package com.wallet.clover.api.service

import com.wallet.clover.api.TestFixtures
import com.wallet.clover.api.repository.winning.WinningInfoRepository
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.shouldBe
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.test.runTest

class StatisticsCalculatorTest : ShouldSpec(
    {
        val repository = mockk<WinningInfoRepository>()
        val sut = StatisticsCalculator(repository)

        context("calculate") {
            should("return correct statistics") {
                // given
                val win1 = TestFixtures.createWinningInfo(round = 1, number1 = 1, number2 = 2, number3 = 3, number4 = 4, number5 = 5, number6 = 6)
                val win2 = TestFixtures.createWinningInfo(round = 2, number1 = 10, number2 = 11, number3 = 12, number4 = 13, number5 = 14, number6 = 15)

                coEvery { repository.findByRoundLessThanEqual(2) } returns kotlinx.coroutines.flow.flowOf(win1, win2)

                // when
                val statistics = sut.calculate(2)

                // then
                statistics.numberFrequency[1] shouldBe 1L
                statistics.numberFrequency[10] shouldBe 1L
            }
        }
    },
)
