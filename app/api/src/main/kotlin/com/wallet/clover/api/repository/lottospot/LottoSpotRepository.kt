package com.wallet.clover.api.repository.lottospot

import com.wallet.clover.api.entity.lottospot.LottoSpotEntity
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository
import kotlinx.coroutines.flow.Flow

@Repository
interface LottoSpotRepository : CoroutineCrudRepository<LottoSpotEntity, Long> {
    suspend fun findByNameContaining(name: String): List<LottoSpotEntity>
    fun findAllBy(pageable: Pageable): Flow<LottoSpotEntity>
}
