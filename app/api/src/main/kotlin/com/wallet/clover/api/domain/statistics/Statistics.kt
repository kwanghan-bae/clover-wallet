package com.wallet.clover.api.domain.statistics

data class Statistics(
    val dateCounter: Map<Int, Map<Int, Long>>,
    val monthCounter: Map<Int, Map<Int, Long>>,
    val oddEvenCounter: Map<String, Map<Int, Long>>,
    val numberFrequency: Map<Int, Long> = emptyMap()
)
