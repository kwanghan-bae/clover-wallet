package com.wallet.clover.api.service

import com.wallet.clover.api.dto.TravelPlan
import org.springframework.stereotype.Service

@Service
class DefaultTravelRecommendationService : TravelRecommendationService {
    override suspend fun recommend(userId: Long): List<TravelPlan.Response> {
        // TODO: 향후 AI 모델 연동 예정
        return emptyList()
    }
}

@Service
class DefaultExternalTravelApiService : ExternalTravelApiService {
    override suspend fun getAttractions(location: String): List<String> {
        // TODO: 카카오 로컬 API 등 연동 예정
        return emptyList()
    }

    override suspend fun getWeather(location: String): String {
        // TODO: 기상청 API 연동 예정
        return "맑음"
    }
}
