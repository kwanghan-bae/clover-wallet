package com.wallet.clover.api.service

import com.wallet.clover.api.dto.LottoSpotResponse
import com.wallet.clover.api.dto.toResponse
import com.wallet.clover.api.repository.lottospot.LottoSpotRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import org.springframework.stereotype.Service

@Service
class LottoSpotService(
    private val lottoSpotRepository: LottoSpotRepository,
) {
    suspend fun getAllLottoSpots(): Flow<LottoSpotResponse> {
        return lottoSpotRepository.findAll().map { it.toResponse() }
    }

    suspend fun searchByName(name: String): List<LottoSpotResponse> {
        return lottoSpotRepository.findByNameContaining(name).map { it.toResponse() }
    }
}
