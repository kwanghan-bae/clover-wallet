package com.wallet.clover.api.dto

import com.wallet.clover.api.domain.extraction.ExtractionMethod
import java.time.LocalDate

abstract class ExtractNumbers {
    data class Request(
        /** 추출 방법 */
        val method: ExtractionMethod,
        /** 꿈 키워드 */
        val dreamKeyword: String? = null,
        /** 생년월일 */
        val birthDate: LocalDate? = null,
        /** 개인 키워드 목록 */
        val personalKeywords: List<String>? = null,
        /** 자연 키워드 */
        val natureKeyword: String? = null,
        /** 점술 키워드 */
        val divinationKeyword: String? = null,
        /** 색상 키워드 */
        val colorKeyword: String? = null,
        /** 동물 키워드 */
        val animalKeyword: String? = null,
    )
}
