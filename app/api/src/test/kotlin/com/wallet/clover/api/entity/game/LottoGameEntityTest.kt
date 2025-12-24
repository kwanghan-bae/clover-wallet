package com.wallet.clover.api.entity.game

import com.wallet.clover.api.TestFixtures
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class LottoGameEntityTest {

    @Test
    fun `calculateRank should identify 1st prize`() {
        val winningInfo = TestFixtures.createWinningInfo(
            number1 = 1, number2 = 2, number3 = 3, number4 = 4, number5 = 5, number6 = 6
        )
        val game = TestFixtures.createLottoGame(
            number1 = 1, number2 = 2, number3 = 3, number4 = 4, number5 = 5, number6 = 6
        )

        val (status, _) = game.calculateRank(winningInfo)
        assertEquals(LottoGameStatus.WINNING_1, status)
    }

    @Test
    fun `calculateRank should identify 2nd prize when bonus matches`() {
        val winningInfo = TestFixtures.createWinningInfo(
            number1 = 1, number2 = 2, number3 = 3, number4 = 4, number5 = 5, number6 = 6, bonusNumber = 7
        )
        val game = TestFixtures.createLottoGame(
            number1 = 1, number2 = 2, number3 = 3, number4 = 4, number5 = 5, number6 = 7 // 5 match + bonus
        )

        val (status, _) = game.calculateRank(winningInfo)
        assertEquals(LottoGameStatus.WINNING_2, status)
    }

    @Test
    fun `calculateRank should identify 3rd prize when 5 match without bonus`() {
        val winningInfo = TestFixtures.createWinningInfo(
            number1 = 1, number2 = 2, number3 = 3, number4 = 4, number5 = 5, number6 = 6, bonusNumber = 7
        )
        val game = TestFixtures.createLottoGame(
            number1 = 1, number2 = 2, number3 = 3, number4 = 4, number5 = 5, number6 = 10 // 5 match only
        )

        val (status, _) = game.calculateRank(winningInfo)
        assertEquals(LottoGameStatus.WINNING_3, status)
    }

    @Test
    fun `calculateRank should identify 4th prize when 4 match`() {
        val winningInfo = TestFixtures.createWinningInfo(number1 = 1, number2 = 2, number3 = 3, number4 = 4)
        val game = TestFixtures.createLottoGame(number1 = 1, number2 = 2, number3 = 3, number4 = 4, number5 = 10, number6 = 11)

        val (status, _) = game.calculateRank(winningInfo)
        assertEquals(LottoGameStatus.WINNING_4, status)
    }

    @Test
    fun `calculateRank should identify 5th prize when 3 match`() {
        val winningInfo = TestFixtures.createWinningInfo(number1 = 1, number2 = 2, number3 = 3)
        val game = TestFixtures.createLottoGame(number1 = 1, number2 = 2, number3 = 3, number4 = 10, number5 = 11, number6 = 12)

        val (status, _) = game.calculateRank(winningInfo)
        assertEquals(LottoGameStatus.WINNING_5, status)
    }

    @Test
    fun `calculateRank should return LOSING when less than 3 match`() {
        val winningInfo = TestFixtures.createWinningInfo(number1 = 1, number2 = 2)
        val game = TestFixtures.createLottoGame(number1 = 1, number2 = 2, number3 = 10, number4 = 11, number5 = 12, number6 = 13)

        val (status, _) = game.calculateRank(winningInfo)
        assertEquals(LottoGameStatus.LOSING, status)
    }
}
