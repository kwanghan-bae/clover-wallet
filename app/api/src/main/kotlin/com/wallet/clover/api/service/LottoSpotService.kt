package com.wallet.clover.api.service

import com.wallet.clover.api.dto.LottoSpotResponse
import com.wallet.clover.api.dto.toResponse
import com.wallet.clover.api.repository.lottospot.LottoSpotRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import org.springframework.stereotype.Service

import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort

@Service
class LottoSpotService(
    private val lottoSpotRepository: LottoSpotRepository,
) {
    suspend fun getAllLottoSpots(page: Int = 0, size: Int = 20): Flow<LottoSpotResponse> {
        val pageable = PageRequest.of(page, size, Sort.by("id").descending())
        return lottoSpotRepository.findAllBy(pageable).map { it.toResponse() }
    }

    suspend fun searchByName(name: String): List<LottoSpotResponse> {
        return lottoSpotRepository.findByNameContaining(name).map { it.toResponse() }
    }
}
