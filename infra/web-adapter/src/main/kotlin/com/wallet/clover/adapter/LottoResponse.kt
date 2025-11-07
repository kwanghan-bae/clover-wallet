package com.wallet.clover.adapter

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonFormat
import java.time.LocalDate

data class LottoResponse(
    val returnValue: LottoResponseCode, // success, fail
    val drwNo: Int?,
    @JsonFormat(pattern = "yyyy-MM-dd", shape = JsonFormat.Shape.STRING)
    val drwNoDate: LocalDate?,
    val totSellamnt: Long?,
    val firstAccumamnt: Long?,
    val firstWinamnt: Long?,
    val firstPrzwnerCo: Int?,
    val drwtNo1: Int?,
    val drwtNo2: Int?,
    val drwtNo3: Int?,
    val drwtNo4: Int?,
    val drwtNo5: Int?,
    val drwtNo6: Int?,
    val bnusNo: Int?,
)

enum class LottoResponseCode {
    OK,
    FAIL,
    ;

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
