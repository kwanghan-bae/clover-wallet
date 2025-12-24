package com.wallet.clover.api.service

import com.wallet.clover.api.dto.TravelPlan

interface TravelRecommendationService {
    suspend fun recommend(userId: Long): List<TravelPlan.Response>
}

interface ExternalTravelApiService {
    suspend fun getAttractions(location: String): List<String>
    suspend fun getWeather(location: String): String
}
