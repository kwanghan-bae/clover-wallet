package com.wallet.clover.api.service

import com.wallet.clover.api.dto.LottoSpot
import com.wallet.clover.api.dto.toResponse
import com.wallet.clover.api.common.PageResponse
import com.wallet.clover.api.repository.lottospot.LottoSpotRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.toList
import org.springframework.stereotype.Service
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort

@Service
class LottoSpotService(
    private val lottoSpotRepository: LottoSpotRepository,
) {
    suspend fun getAllLottoSpots(page: Int = 0, size: Int = 20): PageResponse<LottoSpot.Response> {
        val pageable = PageRequest.of(page, size, Sort.by("id").descending())
        val content = lottoSpotRepository.findAllBy(pageable).map { it.toResponse() }.toList()
        val total = lottoSpotRepository.count()
        return PageResponse.of(content, page, size, total)
    }

    suspend fun searchByName(name: String): List<LottoSpot.Response> {
        return lottoSpotRepository.findByNameContaining(name).map { it.toResponse() }
    }

    suspend fun getSpotById(id: Long): LottoSpot.Response {
        val entity = lottoSpotRepository.findById(id) ?: throw IllegalArgumentException("LottoSpot not found with id: $id")
        return entity.toResponse()
    }
}
