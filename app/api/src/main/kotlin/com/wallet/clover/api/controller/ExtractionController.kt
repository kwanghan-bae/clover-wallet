package com.wallet.clover.api.controller

import com.wallet.clover.api.common.CommonResponse
import com.wallet.clover.api.dto.ExtractionRequest
import com.wallet.clover.api.service.ExtractionService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/extraction")
class ExtractionController(
    private val extractionService: ExtractionService,
) {

    @PostMapping
    suspend fun extractNumbers(@RequestBody request: ExtractionRequest): CommonResponse<Set<Int>> {
        return CommonResponse.success(extractionService.extractLottoNumbers(request))
    }
}
