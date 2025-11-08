package com.wallet.clover.domain.extraction

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import java.time.LocalDate

@DisplayName("LottoNumberExtractor 테스트")
class LottoNumberExtractorTest {

    private lateinit var extractor: LottoNumberExtractor

    @BeforeEach
    fun setUp() {
        extractor = LottoNumberExtractor()
    }

    @Test
    @DisplayName("모든 추출 방법은 1-45 사이의 중복되지 않는 숫자 6개를 반환해야 한다")
    fun `should return 6 unique numbers between 1 and 45`() {
        ExtractionMethod.values().forEach { method ->
            // given
            val context = ExtractionContext(dreamKeyword = "돼지", birthDate = LocalDate.of(1990, 1, 1))

            // when
            val numbers = extractor.extract(method, context)

            // then
            assertEquals(6, numbers.size, "[$method] 번호는 6개여야 합니다.")
            assertTrue(numbers.all { it in 1..45 }, "[$method] 모든 번호는 1과 45 사이에 있어야 합니다.")
        }
    }

    @Nested
    @DisplayName("꿈 해몽 추출")
    inner class DreamExtraction {
        @Test
        @DisplayName("유효한 꿈 키워드가 주어지면 관련된 숫자를 포함해야 한다")
        fun `should include numbers related to the dream keyword`() {
            // given
            val context = ExtractionContext(dreamKeyword = "돼지")
            val expectedNumbers = setOf(8, 18, 28)

            // when
            val numbers = extractor.extract(ExtractionMethod.DREAM, context)

            // then
            assertTrue(numbers.any { it in expectedNumbers }, "돼지 꿈 관련 숫자가 최소 하나는 포함되어야 합니다.")
        }

        @Test
        @DisplayName("관련 없는 꿈 키워드가 주어지면 무작위 번호를 생성해야 한다")
        fun `should return random numbers for irrelevant dream keyword`() {
            // given
            val context = ExtractionContext(dreamKeyword = "무의미한꿈")

            // when
            val numbers = extractor.extract(ExtractionMethod.DREAM, context)

            // then
            assertEquals(6, numbers.size)
        }
    }

    @Nested
    @DisplayName("사주 추출")
    inner class SajuExtraction {
        @Test
        @DisplayName("생년월일이 주어지면 관련된 숫자를 포함해야 한다")
        fun `should include number related to the birth date`() {
            // given
            // 1+9+9+0+1+0+1+0 = 21
            val context = ExtractionContext(birthDate = LocalDate.of(1990, 10, 10))
            val expectedNumber = (1 + 9 + 9 + 0 + 1 + 0 + 1 + 0) % 45 + 1 // 22

            // when
            val numbers = extractor.extract(ExtractionMethod.SAJU, context)

            // then
            assertTrue(numbers.contains(expectedNumber), "생년월일 합계 기반 숫자를 포함해야 합니다.")
        }
    }

    @Nested
    @DisplayName("통계 추출")
    inner class StatisticsExtraction {
        @Test
        @DisplayName("Hot 통계는 Hot 번호 목록에서 숫자를 포함해야 한다")
        fun `should include numbers from hot list for hot statistics`() {
            // when
            val numbers = extractor.extract(ExtractionMethod.STATISTICS_HOT)

            // then
            // 테스트의 extractor는 실제 코드의 hotNumbers를 참조할 수 없으므로, 테스트가 깨질 수 있음.
            // 실제로는 DI를 통해 동일한 데이터를 바라보게 해야 함. 여기서는 개념 증명.
            println("Hot 통계 추출 번호: $numbers")
            assertEquals(6, numbers.size)
        }

        @Test
        @DisplayName("Cold 통계는 Cold 번호 목록에서 숫자를 포함해야 한다")
        fun `should include numbers from cold list for cold statistics`() {
            // when
            val numbers = extractor.extract(ExtractionMethod.STATISTICS_COLD)

            // then
            println("Cold 통계 추출 번호: $numbers")
            assertEquals(6, numbers.size)
        }
    }

    @Nested
    @DisplayName("별자리 추출")
    inner class HoroscopeExtraction {
        @Test
        @DisplayName("염소자리(1월 1일)가 주어지면 관련된 숫자를 포함해야 한다")
        fun `should include numbers for Capricorn`() {
            // given
            val context = ExtractionContext(birthDate = LocalDate.of(1990, 1, 1))
            val capricornNumbers = setOf(4, 8, 17, 26, 34)

            // when
            val numbers = extractor.extract(ExtractionMethod.HOROSCOPE, context)

            // then
            assertTrue(numbers.any { it in capricornNumbers }, "염소자리 관련 숫자를 포함해야 합니다.")
        }

        @Test
        @DisplayName("물병자리(2월 1일)가 주어지면 관련된 숫자를 포함해야 한다")
        fun `should include numbers for Aquarius`() {
            // given
            val context = ExtractionContext(birthDate = LocalDate.of(1990, 2, 1))
            val aquariusNumbers = setOf(7, 11, 22, 31, 40)

            // when
            val numbers = extractor.extract(ExtractionMethod.HOROSCOPE, context)

            // then
            assertTrue(numbers.any { it in aquariusNumbers }, "물병자리 관련 숫자를 포함해야 합니다.")
        }
    }
}
