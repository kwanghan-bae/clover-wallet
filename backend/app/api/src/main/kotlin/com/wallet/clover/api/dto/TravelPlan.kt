package com.wallet.clover.api.dto

import com.wallet.clover.api.entity.travel.TravelPlanEntity
import java.time.LocalDateTime

abstract class TravelPlan {
    data class Response(
        val id: Long,
        val spotId: Long,
        val title: String,
        val description: String,
        val places: String,  // JSON string
        val theme: String,
        val estimatedHours: Int,
        val createdAt: LocalDateTime
    )
}

fun TravelPlanEntity.toResponse() = TravelPlan.Response(
    id = id ?: throw IllegalStateException("TravelPlan ID must not be null"),
    spotId = spotId,
    title = title,
    description = description,
    places = places,
    theme = theme,
    estimatedHours = estimatedHours,
    createdAt = createdAt
)
