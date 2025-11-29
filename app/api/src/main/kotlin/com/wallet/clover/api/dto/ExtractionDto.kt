package com.wallet.clover.api.dto

import com.wallet.clover.api.domain.extraction.ExtractionMethod
import java.time.LocalDate

data class ExtractionRequest(
    val method: ExtractionMethod,
    val dreamKeyword: String? = null,
    val birthDate: LocalDate? = null,
    val personalKeywords: List<String>? = null,
    val natureKeyword: String? = null,
    val divinationKeyword: String? = null,
    val colorKeyword: String? = null,
    val animalKeyword: String? = null
)
