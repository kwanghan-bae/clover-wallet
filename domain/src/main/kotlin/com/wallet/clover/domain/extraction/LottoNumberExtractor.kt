package com.wallet.clover.domain.extraction

import java.time.LocalDate
import kotlin.random.Random

/**
 * 미신적 방법론에 기반하여 로또 번호를 추출하는 클래스입니다.
 * 각 추출 방법은 재미를 위한 요소이며, 실제 당첨 확률에 영향을 주지 않습니다.
 */
class LottoNumberExtractor {

    companion object {
        private const val LOTTO_MIN_NUMBER = 1
        private const val LOTTO_MAX_NUMBER = 45
        private const val LOTTO_NUMBERS_COUNT = 6
    }

    /**
     * 주어진 추출 방법에 따라 로또 번호 6개를 생성합니다.
     *
     * @param method 번호 추출 방법
     * @param context 추출에 필요한 추가 정보 (꿈 키워드, 생년월일 등)
     * @return 중복되지 않는 1-45 사이의 로또 번호 6개 Set
     */
    fun extract(method: ExtractionMethod, context: ExtractionContext? = null): Set<Int> {
        val seedNumbers = when (method) {
            ExtractionMethod.DREAM -> extractFromDream(context?.dreamKeyword)
            ExtractionMethod.SAJU -> extractFromSaju(context?.birthDate)
            ExtractionMethod.STATISTICS_HOT -> extractFromStatistics(hotNumbers)
            ExtractionMethod.STATISTICS_COLD -> extractFromStatistics(coldNumbers)
            ExtractionMethod.HOROSCOPE -> extractFromHoroscope(context?.birthDate)
        }

        return generateNumbers(seedNumbers)
    }

    /**
     * 꿈 해몽 기반 번호 추출.
     * 간단한 키워드-숫자 매핑을 사용합니다.
     */
    private fun extractFromDream(keyword: String?): Set<Int> {
        if (keyword == null) return emptySet()
        return dreamNumberMap[keyword] ?: emptySet()
    }

    /**
     * 사주 기반 번호 추출.
     * 생년월일의 각 자릿수를 더하고, 그 합을 기반으로 번호를 생성하는 단순화된 로직입니다.
     */
    private fun extractFromSaju(birthDate: LocalDate?): Set<Int> {
        if (birthDate == null) return emptySet()
        val sum = birthDate.year.toString().sumOf { it.digitToInt() } +
            birthDate.monthValue.toString().sumOf { it.digitToInt() } +
            birthDate.dayOfMonth.toString().sumOf { it.digitToInt() }
        return setOf(sum % LOTTO_MAX_NUMBER + 1)
    }

    /**
     * 통계 기반 번호 추출.
     * 미리 정의된 Hot/Cold 번호 리스트에서 일부를 선택합니다.
     */
    private fun extractFromStatistics(numberList: List<Int>): Set<Int> {
        return numberList.shuffled().take(Random.nextInt(1, 4)).toSet()
    }

    /**
     * 별자리 기반 번호 추출.
     * 생일에 해당하는 별자리의 행운의 숫자를 반환합니다.
     */
    private fun extractFromHoroscope(birthDate: LocalDate?): Set<Int> {
        if (birthDate == null) return emptySet()
        val sign = getZodiacSign(birthDate)
        return horoscopeNumberMap[sign] ?: emptySet()
    }

    /**
     * 시드 번호(미리 선택된 번호)를 포함하여 최종 로또 번호 셋을 생성합니다.
     *
     * @param seedNumbers 우선적으로 포함될 번호 Set
     * @return 최종 로또 번호 6개
     */
    private fun generateNumbers(seedNumbers: Set<Int>): Set<Int> {
        val validSeedNumbers = seedNumbers.filter { it in LOTTO_MIN_NUMBER..LOTTO_MAX_NUMBER }.toMutableSet()

        while (validSeedNumbers.size < LOTTO_NUMBERS_COUNT) {
            val randomNumber = Random.nextInt(LOTTO_MIN_NUMBER, LOTTO_MAX_NUMBER + 1)
            validSeedNumbers.add(randomNumber)
        }

        return validSeedNumbers.take(LOTTO_NUMBERS_COUNT).toSortedSet()
    }

    private fun getZodiacSign(birthDate: LocalDate): ZodiacSign {
        return when (birthDate.monthValue) {
            1 -> if (birthDate.dayOfMonth <= 20) ZodiacSign.CAPRICORN else ZodiacSign.AQUARIUS
            2 -> if (birthDate.dayOfMonth <= 18) ZodiacSign.AQUARIUS else ZodiacSign.PISCES
            3 -> if (birthDate.dayOfMonth <= 20) ZodiacSign.PISCES else ZodiacSign.ARIES
            4 -> if (birthDate.dayOfMonth <= 20) ZodiacSign.ARIES else ZodiacSign.TAURUS
            5 -> if (birthDate.dayOfMonth <= 20) ZodiacSign.TAURUS else ZodiacSign.GEMINI
            6 -> if (birthDate.dayOfMonth <= 21) ZodiacSign.GEMINI else ZodiacSign.CANCER
            7 -> if (birthDate.dayOfMonth <= 22) ZodiacSign.CANCER else ZodiacSign.LEO
            8 -> if (birthDate.dayOfMonth <= 22) ZodiacSign.LEO else ZodiacSign.VIRGO
            9 -> if (birthDate.dayOfMonth <= 22) ZodiacSign.VIRGO else ZodiacSign.LIBRA
            10 -> if (birthDate.dayOfMonth <= 23) ZodiacSign.LIBRA else ZodiacSign.SCORPIO
            11 -> if (birthDate.dayOfMonth <= 22) ZodiacSign.SCORPIO else ZodiacSign.SAGITTARIUS
            12 -> if (birthDate.dayOfMonth <= 21) ZodiacSign.SAGITTARIUS else ZodiacSign.CAPRICORN
            else -> throw IllegalArgumentException("Invalid month")
        }
    }

    // --- 데이터 영역 ---
    // 실제 애플리케이션에서는 DB나 외부 파일에서 관리하는 것이 좋습니다.

    private val dreamNumberMap = mapOf(
        "돼지" to setOf(8, 18, 28),
        "조상" to setOf(14, 15, 25),
        "용" to setOf(1, 5, 12),
        "물" to setOf(1, 6, 16),
        "불" to setOf(3, 8, 13),
    )

    private val hotNumbers = listOf(34, 1, 13, 12, 27, 45, 17, 20, 33, 39) // 예시 데이터
    private val coldNumbers = listOf(9, 22, 23, 29, 30, 3, 6, 7, 10, 11) // 예시 데이터

    enum class ZodiacSign {
        ARIES,
        TAURUS,
        GEMINI,
        CANCER,
        LEO,
        VIRGO,
        LIBRA,
        SCORPIO,
        SAGITTARIUS,
        CAPRICORN,
        AQUARIUS,
        PISCES,
    }

    private val horoscopeNumberMap = mapOf(
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
}

/**
 * 번호 추출에 필요한 추가 정보를 담는 데이터 클래스입니다.
 */
data class ExtractionContext(
    val dreamKeyword: String? = null,
    val birthDate: LocalDate? = null,
)
