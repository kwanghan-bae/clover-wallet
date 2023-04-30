package com.wallet.clover.api.endpoint

import com.wallet.clover.domain.recommendation.Recommendation

interface RecommendSpec {
    fun get(): Recommendation
}
