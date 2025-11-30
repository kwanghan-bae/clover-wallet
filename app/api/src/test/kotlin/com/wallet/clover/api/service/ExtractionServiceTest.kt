package com.wallet.clover.api.service

import com.wallet.clover.api.domain.extraction.ExtractionContext
import com.wallet.clover.api.domain.extraction.ExtractionMethod
import com.wallet.clover.api.dto.ExtractNumbers
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import java.time.LocalDate

@DisplayName("ExtractionService 테스트")
class ExtractionServiceTest {

    private lateinit var lottoNumberExtractor: LottoNumberExtractor
    private lateinit var extractionService: ExtractionService

    @BeforeEach
    fun setUp() {
        lottoNumberExtractor = mockk<LottoNumberExtractor>()
        extractionService = ExtractionService(lottoNumberExtractor)
    }

    @Test
    @DisplayName("extractLottoNumbers는 LottoNumberExtractor를 호출하고 결과를 반환해야 한다")
    fun `extractLottoNumbers should call LottoNumberExtractor and return result`() = runTest {
        // given
        val method = ExtractionMethod.DREAM
        val dreamKeyword = "돼지"
        val birthDate = LocalDate.of(1990, 1, 1)
        val personalKeywords = listOf("19880715")
        val natureKeyword = "피보나치"
        val divinationKeyword = "주역"
        val colorKeyword = "빨강"
        val animalKeyword = "까치"
        val expectedNumbers = setOf(1, 2, 3, 4, 5, 6)

        coEvery { lottoNumberExtractor.extract(any(), any()) } returns expectedNumbers

        val request = ExtractNumbers.Request(
            method = method,
            dreamKeyword = dreamKeyword,
            birthDate = birthDate,
            personalKeywords = personalKeywords,
            natureKeyword = natureKeyword,
            divinationKeyword = divinationKeyword,
            colorKeyword = colorKeyword,
            animalKeyword = animalKeyword,
        )

        // when
        val result = extractionService.extractLottoNumbers(request)

        // then
        assertEquals(expectedNumbers, result)
        coVerify(exactly = 1) {
            lottoNumberExtractor.extract(
                method,
                ExtractionContext(
                    dreamKeyword = dreamKeyword,
                    birthDate = birthDate,
                    personalKeywords = personalKeywords,
                    natureKeyword = natureKeyword,
                    divinationKeyword = divinationKeyword,
                    colorKeyword = colorKeyword,
                    animalKeyword = animalKeyword,
                ),
            )
        }
    }
}
