package com.wallet.clover.api.service

import com.wallet.clover.api.dto.TravelPlan
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class DefaultTravelRecommendationService : TravelRecommendationService {
    override suspend fun recommend(userId: Long): List<TravelPlan.Response> {
        // Mock Data: 실제 AI 모델 연동 전, 사용자에게 보여줄 더미 데이터 반환
        // [Live Prep] Removing mock data as requested. Returning empty list until real implementation.
        return emptyList()
        /*
        return listOf(
            TravelPlan.Response(
                id = 1,
                spotId = 101, // 제주도 로또 명당 ID (가정)
                title = "제주 힐링 & 대박 기원 여행",
                description = "푸른 제주 바다를 보며 힐링하고, 소원 비는 돌하르방 코스",
                places = """
                    [
                        {"name": "성산일출봉", "category": "명소", "lat": 33.458, "lng": 126.942},
                        {"name": "섭지코지", "category": "명소", "lat": 33.424, "lng": 126.931},
                        {"name": "제주 흑돼지 맛집", "category": "맛집", "lat": 33.450, "lng": 126.920}
                    ]
                """.trimIndent(),
                theme = "HEALING",
                estimatedHours = 6,
                createdAt = LocalDateTime.now()
            ),
            TravelPlan.Response(
                id = 2,
                spotId = 102, // 경주 ID
                title = "경주 역사 속 로또 명당 찾기",
                description = "천년의 고도 경주에서 역사의 기운을 받아 대박을 꿈꾸다",
                places = """
                    [
                        {"name": "불국사", "category": "명소", "lat": 35.790, "lng": 129.332},
                        {"name": "첨성대", "category": "명소", "lat": 35.834, "lng": 129.219},
                        {"name": "황리단길 카페", "category": "카페", "lat": 35.838, "lng": 129.209}
                    ]
                """.trimIndent(),
                theme = "HISTORY",
                estimatedHours = 5,
                createdAt = LocalDateTime.now()
            ),
            TravelPlan.Response(
                id = 3,
                spotId = 103, // 서울 ID
                title = "서울 도심 속 행운 투어",
                description = "서울 3대 로또 명당을 순회하며 좋은 기운을 모으는 코스",
                places = """
                    [
                        {"name": "N서울타워", "category": "명소", "lat": 37.551, "lng": 126.988},
                        {"name": "광장시장", "category": "맛집", "lat": 37.570, "lng": 126.999},
                        {"name": "청계천 산책로", "category": "산책", "lat": 37.569, "lng": 127.006}
                    ]
                """.trimIndent(),
                theme = "CITY",
                estimatedHours = 4,
                createdAt = LocalDateTime.now()
            )
        )
        */
    }
}

@Service
class DefaultExternalTravelApiService : ExternalTravelApiService {
    override suspend fun getAttractions(location: String): List<String> {
        return listOf("유명한 랜드마크", "현지인 맛집", "분위기 좋은 카페")
    }

    override suspend fun getWeather(location: String): String {
        return "맑음 (24°C)"
    }
}
