package com.wallet.clover.api.service

import com.wallet.clover.api.entity.lottospot.LottoSpotEntity
import com.wallet.clover.api.repository.lottospot.LottoSpotRepository
import kotlinx.coroutines.flow.Flow
import org.springframework.stereotype.Service

@Service
class LottoSpotService(
    private val lottoSpotRepository: LottoSpotRepository,
) {
    suspend fun getAllLottoSpots(): Flow<LottoSpotEntity> {
        return lottoSpotRepository.findAll()
    }

    suspend fun searchByName(name: String): List<LottoSpotEntity> {
        return lottoSpotRepository.findByNameContaining(name)
    }
}
