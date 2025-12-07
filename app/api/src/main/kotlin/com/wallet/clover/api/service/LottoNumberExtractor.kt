package com.wallet.clover.api.service

import com.wallet.clover.api.domain.extraction.ExtractionContext
import com.wallet.clover.api.domain.extraction.ExtractionMethod
import org.springframework.stereotype.Component
import java.time.LocalDate
import kotlin.random.Random

/**
 * 미신적 방법론에 기반하여 로또 번호를 추출하는 클래스입니다.
 * 각 추출 방법은 재미를 위한 요소이며, 실제 당첨 확률에 영향을 주지 않습니다.
 */
@Component
class LottoNumberExtractor(
    private val random: Random = Random.Default,
    private val statisticsCalculator: StatisticsCalculator
) {

    companion object {
        private const val LOTTO_MIN_NUMBER = 1
        private const val LOTTO_MAX_NUMBER = 45
        private const val LOTTO_NUMBERS_COUNT = 6
        private const val STATS_GAME_COUNT = 100 // 최근 100회차 기준
    }

    /**
     * 주어진 추출 방법에 따라 로또 번호 6개를 생성합니다.
     *
     * @param method 번호 추출 방법
     * @param context 추출에 필요한 추가 정보 (꿈 키워드, 생년월일 등)
     * @return 중복되지 않는 1-45 사이의 로또 번호 6개 Set
     */
    suspend fun extract(method: ExtractionMethod, context: ExtractionContext? = null): Set<Int> {
        val seedNumbers = when (method) {
            ExtractionMethod.DREAM -> extractFromDream(context?.dreamKeyword)
            ExtractionMethod.SAJU -> extractFromSaju(context?.birthDate)
            ExtractionMethod.STATISTICS_HOT -> extractFromStatistics(getHotNumbers())
            ExtractionMethod.STATISTICS_COLD -> extractFromStatistics(getColdNumbers())
            ExtractionMethod.HOROSCOPE -> extractFromHoroscope(context?.birthDate)
            ExtractionMethod.PERSONAL_SIGNIFICANCE -> extractFromPersonalSignificance(context?.personalKeywords)
            ExtractionMethod.NATURE_PATTERNS -> extractFromNaturePatterns(context?.natureKeyword)
            ExtractionMethod.ANCIENT_DIVINATION -> extractFromAncientDivination(context?.divinationKeyword)
            ExtractionMethod.COLORS_SOUNDS -> extractFromColorsSounds(context?.colorKeyword)
            ExtractionMethod.ANIMAL_OMENS -> extractFromAnimalOmens(context?.animalKeyword)
        }

        return generateNumbers(seedNumbers)
    }

    private suspend fun getHotNumbers(): List<Int> {
        return try {
            val stats = statisticsCalculator.calculate(STATS_GAME_COUNT)
            stats.numberFrequency.entries.sortedByDescending { it.value }.take(10).map { it.key }
        } catch (e: Exception) {
            // Fallback
            listOf(34, 1, 13, 12, 27, 45, 17, 20, 33, 39)
        }
    }

    private suspend fun getColdNumbers(): List<Int> {
        return try {
            val stats = statisticsCalculator.calculate(STATS_GAME_COUNT)
            stats.numberFrequency.entries.sortedBy { it.value }.take(10).map { it.key }
        } catch (e: Exception) {
            // Fallback
            listOf(9, 22, 23, 29, 30, 3, 6, 7, 10, 11)
        }
    }

    /**
     * 꿈 해몽 기반 번호 추출.
     * 간단한 키워드-숫자 매핑을 사용합니다.
     */
    private fun extractFromDream(keyword: String?): Set<Int> {
        if (keyword == null) return emptySet()
        return LottoExtractionData.dreamNumberMap[keyword] ?: emptySet()
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
        return numberList.shuffled(random).take(random.nextInt(1, 4)).toSet()
    }

    /**
     * 별자리 기반 번호 추출.
     * 생일에 해당하는 별자리의 행운의 숫자를 반환합니다.
     */
    private fun extractFromHoroscope(birthDate: LocalDate?): Set<Int> {
        if (birthDate == null) return emptySet()
        val sign = getZodiacSign(birthDate)
        return LottoExtractionData.horoscopeNumberMap[sign] ?: emptySet()
    }

    /**
     * 개인적인 의미 부여 기반 번호 추출.
     * 입력된 키워드(예: 기념일, 전화번호)에서 숫자를 추출합니다.
     */
    private fun extractFromPersonalSignificance(keywords: List<String>?): Set<Int> {
        if (keywords.isNullOrEmpty()) return emptySet()
        val numbers = mutableSetOf<Int>()
        keywords.forEach { keyword ->
            keyword.filter { it.isDigit() }.chunked(2).forEach {
                it.toIntOrNull()?.let { num ->
                    if (num in LOTTO_MIN_NUMBER..LOTTO_MAX_NUMBER) numbers.add(num)
                }
            }
        }
        return numbers
    }

    /**
     * 자연의 리듬과 패턴 기반 번호 추출.
     * 피보나치 수열 등 자연 패턴에서 숫자를 가져옵니다.
     */
    private fun extractFromNaturePatterns(keyword: String?): Set<Int> {
        if (keyword == "피보나치") {
            return LottoExtractionData.fibonacciNumbers.filter { it in LOTTO_MIN_NUMBER..LOTTO_MAX_NUMBER }.toSet()
        }
        return LottoExtractionData.naturePatternsMap[keyword] ?: emptySet()
    }

    /**
     * 고대 점술 기반 번호 추출.
     * 주역 괘나 룬 문자 등에서 연관된 숫자를 가져옵니다.
     */
    private fun extractFromAncientDivination(keyword: String?): Set<Int> {
        return LottoExtractionData.ancientDivinationMap[keyword] ?: emptySet()
    }

    /**
     * 색상 및 소리 기반 번호 추출.
     * 색상이나 소리 주파수와 연관된 숫자를 가져옵니다.
     */
    private fun extractFromColorsSounds(keyword: String?): Set<Int> {
        return LottoExtractionData.colorsSoundsMap[keyword] ?: emptySet()
    }

    /**
     * 동물 징조 기반 번호 추출.
     * 특정 동물과 연관된 숫자를 가져옵니다.
     */
    private fun extractFromAnimalOmens(keyword: String?): Set<Int> {
        return LottoExtractionData.animalOmensMap[keyword] ?: emptySet()
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
            val randomNumber = random.nextInt(LOTTO_MIN_NUMBER, LOTTO_MAX_NUMBER + 1)
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

    enum class ZodiacSign {
        ARIES, TAURUS, GEMINI, CANCER, LEO, VIRGO, LIBRA, SCORPIO, SAGITTARIUS, CAPRICORN, AQUARIUS, PISCES,
    }
}
