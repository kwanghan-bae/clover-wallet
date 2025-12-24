package com.wallet.clover.api.service

import com.wallet.clover.api.dto.TravelPlan
import com.wallet.clover.api.dto.toResponse
import com.wallet.clover.api.repository.travel.TravelPlanRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import org.springframework.stereotype.Service

@Service
class TravelPlanService(
    private val travelPlanRepository: TravelPlanRepository,
    private val travelRecommendationService: TravelRecommendationService,
    private val externalTravelApiService: ExternalTravelApiService
) {
    
    /**
     * 전체 여행 플랜 조회
     */
    fun getAllTravelPlans(): Flow<TravelPlan.Response> {
        return travelPlanRepository.findAll().map { it.toResponse() }
    }
    
    /**
     * 사용자 맞춤형 여행 플랜 추천
     */
    suspend fun getRecommendedTravelPlans(userId: Long): List<TravelPlan.Response> {
        return travelRecommendationService.recommend(userId)
    }

    /**
     * 특정 명당 기반 여행 플랜 조회
     */
    fun getTravelPlansBySpot(spotId: Long): Flow<TravelPlan.Response> {
        return travelPlanRepository.findBySpotId(spotId).map { it.toResponse() }
    }
    
    /**
     * 테마별 여행 플랜 조회
     */
    fun getTravelPlansByTheme(theme: String): Flow<TravelPlan.Response> {
        return travelPlanRepository.findByTheme(theme).map { it.toResponse() }
    }
    
    /**
     * ID로 여행 플랜 조회
     */
    suspend fun getTravelPlanById(id: Long): TravelPlan.Response? {
        return travelPlanRepository.findById(id)?.toResponse()
    }
}
