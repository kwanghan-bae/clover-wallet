package com.wallet.clover.api.service

import com.wallet.clover.api.dto.TravelPlan
import com.wallet.clover.api.dto.toResponse
import com.wallet.clover.api.repository.travel.TravelPlanRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import org.springframework.stereotype.Service

@Service
class TravelPlanService(
    private val travelPlanRepository: TravelPlanRepository
) {
    
    // TODO: 사용자 선호도 기반 AI 추천 로직 추가
    // TODO: 외부 API (카카오 로컬, 공공데이터 관광정보) 연동
    // TODO: 실시간 날씨/교통 정보 통합
    
    /**
     * 전체 여행 플랜 조회
     */
    fun getAllTravelPlans(): Flow<TravelPlan.Response> {
        return travelPlanRepository.findAll().map { it.toResponse() }
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
