package com.wallet.clover.api.dto

import com.wallet.clover.api.domain.extraction.ExtractionMethod

data class SaveGeneratedGameRequest(
    val userId: Long,
    val numbers: List<Int>,
    val extractionMethod: ExtractionMethod? = null
)
