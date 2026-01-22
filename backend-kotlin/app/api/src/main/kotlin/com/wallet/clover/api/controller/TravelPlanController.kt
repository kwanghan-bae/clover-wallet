package com.wallet.clover.api.controller

import com.wallet.clover.api.common.CommonResponse
import com.wallet.clover.api.dto.TravelPlan
import com.wallet.clover.api.service.TravelPlanService
import kotlinx.coroutines.flow.Flow
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/travel-plans")
class TravelPlanController(
    private val travelPlanService: TravelPlanService
) {
    
    /**
     * 전체 여행 플랜 조회
     */
    @GetMapping
    fun getAllTravelPlans(): Flow<TravelPlan.Response> {
        return travelPlanService.getAllTravelPlans()
    }
    
    /**
     * 특정 명당의 여행 플랜 조회
     */
    @GetMapping("/spot/{spotId}")
    fun getTravelPlansBySpot(@PathVariable spotId: Long): Flow<TravelPlan.Response> {
        return travelPlanService.getTravelPlansBySpot(spotId)
    }
    
    /**
     * 테마별 여행 플랜 조회
     */
    @GetMapping("/theme/{theme}")
    fun getTravelPlansByTheme(@PathVariable theme: String): Flow<TravelPlan.Response> {
        return travelPlanService.getTravelPlansByTheme(theme)
    }
    
    /**
     * ID로 여행 플랜 상세 조회
     */
    @GetMapping("/{id}")
    suspend fun getTravelPlanById(@PathVariable id: Long): CommonResponse<TravelPlan.Response?> {
        val plan = travelPlanService.getTravelPlanById(id)
        return CommonResponse.success(plan)
    }
}
