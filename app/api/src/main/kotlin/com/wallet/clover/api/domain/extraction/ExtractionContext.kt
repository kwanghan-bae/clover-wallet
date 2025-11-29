package com.wallet.clover.api.domain.extraction

import java.time.LocalDate

/**
 * 번호 추출에 필요한 추가 정보를 담는 데이터 클래스입니다.
 */
data class ExtractionContext(
    val dreamKeyword: String? = null,
    val birthDate: LocalDate? = null,
    val personalKeywords: List<String>? = null, // 개인적인 의미 부여
    val natureKeyword: String? = null, // 자연의 리듬과 패턴
    val divinationKeyword: String? = null, // 고대 점술
    val colorKeyword: String? = null, // 색상 및 소리
    val animalKeyword: String? = null, // 동물 징조
)
