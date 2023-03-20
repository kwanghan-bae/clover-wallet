package com.lotto.manager.adapter

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonFormat
import com.lotto.manager.domain.lotto.Lotto
import java.time.LocalDate

data class LottoResponse(
    val totSellamnt: Long?,
    val returnValue: LottoResponseCode, // success, fail
    @JsonFormat(pattern = "yyyy-MM-dd", shape = JsonFormat.Shape.STRING)
    val drwNoDate: LocalDate?,
    val firstWinamnt: Long?,
    val drwtNo6: Int?,
    val drwtNo4: Int?,
    val firstPrzwnerCo: Int?,
    val drwtNo5: Int?,
    val bnusNo: Int?,
    val firstAccumamnt: Long?,
    val drwNo: Int?,
    val drwtNo2: Int?,
    val drwtNo3: Int?,
    val drwtNo1: Int?,
) {
    
    
    fun toDomain() = Lotto(
        number1 = drwtNo1!!,
        number2 = drwtNo2!!,
        number3 = drwtNo3!!,
        number4 = drwtNo4!!,
        number5 = drwtNo5!!,
        number6 = drwtNo6!!,
        bonusNumber = bnusNo!!,
        totalRevenue = totSellamnt!!,
        countOfFirstWinners = firstPrzwnerCo!!,
        moneyOfFirstWinner = firstWinamnt!!,
        gameNumber = drwNo!!,
        drawDate = drwNoDate!!
    )
}

enum class LottoResponseCode {
    OK,
    FAIL;

    companion object {
        @JvmStatic
        @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
        fun valueOfPlain(plain: String): LottoResponseCode {
            return if (plain == "success") {
                OK
            } else {
                FAIL
            }
        }
    }
}


