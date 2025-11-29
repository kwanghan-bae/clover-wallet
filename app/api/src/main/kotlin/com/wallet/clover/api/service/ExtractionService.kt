package com.wallet.clover.api.service

import com.wallet.clover.api.domain.extraction.ExtractionContext
import com.wallet.clover.api.domain.extraction.ExtractionMethod
import com.wallet.clover.api.domain.extraction.LottoNumberExtractor
import org.springframework.stereotype.Service
import java.time.LocalDate

/**
 * 로또 번호 추출 기능을 제공하는 애플리케이션 서비스입니다.
 * 다양한 미신적 방법론에 따라 로또 번호를 생성합니다.
 */
@Service
class ExtractionService(
    private val lottoNumberExtractor: LottoNumberExtractor,
) {
    /**
     * 지정된 추출 방법에 따라 로또 번호를 생성합니다.
     *
     * @param method 사용할 추출 방법
     * @param dreamKeyword 꿈 해몽 추출 시 사용될 키워드 (선택 사항)
     * @param birthDate 사주 또는 별자리 추출 시 사용될 생년월일 (선택 사항)
     * @return 생성된 로또 번호 6개 Set
     */
    fun extractLottoNumbers(
        method: ExtractionMethod,
        dreamKeyword: String? = null,
        birthDate: LocalDate? = null,
        personalKeywords: List<String>? = null,
        natureKeyword: String? = null,
        divinationKeyword: String? = null,
        colorKeyword: String? = null,
        animalKeyword: String? = null,
    ): Set<Int> {
        val context = ExtractionContext(
            dreamKeyword = dreamKeyword,
            birthDate = birthDate,
            personalKeywords = personalKeywords,
            natureKeyword = natureKeyword,
            divinationKeyword = divinationKeyword,
            colorKeyword = colorKeyword,
            animalKeyword = animalKeyword,
        )
        return lottoNumberExtractor.extract(method, context)
    }
}
