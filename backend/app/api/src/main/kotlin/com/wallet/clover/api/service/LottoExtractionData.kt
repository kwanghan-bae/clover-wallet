package com.wallet.clover.api.service

import com.wallet.clover.api.service.LottoNumberExtractor.ZodiacSign

object LottoExtractionData {
    // TODO: DB나 외부 설정에서 동적으로 로딩하도록 개선 필요
    val dreamNumberMap = mapOf(
        "돼지" to setOf(8, 18, 28),
        "조상" to setOf(14, 15, 25),
        "용" to setOf(1, 5, 12),
        "물" to setOf(1, 6, 16),
        "불" to setOf(3, 8, 13),
    )

    val fibonacciNumbers = listOf(1, 2, 3, 5, 8, 13, 21, 34) // 피보나치 수열 예시

    val horoscopeNumberMap = mapOf(
        ZodiacSign.ARIES to setOf(6, 17, 25, 34, 41),
        ZodiacSign.TAURUS to setOf(5, 15, 23, 33, 45),
        ZodiacSign.GEMINI to setOf(1, 10, 19, 28, 37),
        ZodiacSign.CANCER to setOf(2, 7, 11, 20, 29),
        ZodiacSign.LEO to setOf(1, 9, 18, 27, 36),
        ZodiacSign.VIRGO to setOf(4, 14, 24, 33, 43),
        ZodiacSign.LIBRA to setOf(6, 16, 25, 35, 44),
        ZodiacSign.SCORPIO to setOf(8, 13, 21, 30, 38),
        ZodiacSign.SAGITTARIUS to setOf(3, 12, 21, 30, 39),
        ZodiacSign.CAPRICORN to setOf(4, 8, 17, 26, 34),
        ZodiacSign.AQUARIUS to setOf(7, 11, 22, 31, 40),
        ZodiacSign.PISCES to setOf(2, 9, 18, 27, 35),
    )
    
    val naturePatternsMap = mapOf(
        "봄" to setOf(3, 4, 5),
        "여름" to setOf(6, 7, 8),
        "가을" to setOf(9, 10, 11),
        "겨울" to setOf(12, 1, 2)
    )
    
    val ancientDivinationMap = mapOf(
        "주역" to setOf(1, 6, 8, 11, 24, 30),
        "룬" to setOf(3, 9, 13, 21, 27, 40)
    )
    
    val colorsSoundsMap = mapOf(
        "빨강" to setOf(1, 10, 19, 28, 37),
        "초록" to setOf(4, 13, 22, 31, 40),
        "금색" to setOf(7, 16, 25, 34, 43)
    )
    
    val animalOmensMap = mapOf(
        "까치" to setOf(7, 17, 27),
        "검은고양이" to setOf(13, 26, 39),
        "뱀" to setOf(4, 14, 24)
    )
}
