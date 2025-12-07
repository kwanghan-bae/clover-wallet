package com.wallet.clover.api.repository.travel

import com.wallet.clover.api.entity.travel.TravelPlanEntity
import kotlinx.coroutines.flow.Flow
import org.springframework.data.repository.kotlin.CoroutineCrudRepository

interface TravelPlanRepository : CoroutineCrudRepository<TravelPlanEntity, Long> {
    fun findBySpotId(spotId: Long): Flow<TravelPlanEntity>
    fun findByTheme(theme: String): Flow<TravelPlanEntity>
}
