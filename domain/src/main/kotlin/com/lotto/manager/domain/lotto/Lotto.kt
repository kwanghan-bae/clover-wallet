package com.lotto.manager.domain.lotto

import java.time.LocalDate

/**
{
"returnValue":"success",			// 요청결과
"drwNoDate":"2004-10-30",			// 날짜
"totSellamnt":56561977000,			// 총상금액
"firstWinamnt":3315315525,			// 1등 상금액
"firstPrzwnerCo":4,				// 1등 당첨인원
"firstAccumamnt":0,
"drwtNo1":1,					// 로또번호 1
"drwtNo2":7,					// 로또번호 2
"drwtNo3":11,					// 로또번호 3
"drwtNo4":23,					// 로또번호 4
"drwtNo5":37,					// 로또번호 5
"drwtNo6":42,					// 로또번호 6
"bnusNo":6,					// 로또 보너스 번호
"drwNo":100					// 로또회차
}
 */
data class Lotto(
    val number1: Int,
    val number2: Int,
    val number3: Int,
    val number4: Int,
    val number5: Int,
    val number6: Int,
    val bonusNumber: Int,
    val totalRevenue: Long,
    val countOfFirstWinners: Int,
    val moneyOfFirstWinner: Long,
    val gameNumber: Int,
    val drawDate: LocalDate
)