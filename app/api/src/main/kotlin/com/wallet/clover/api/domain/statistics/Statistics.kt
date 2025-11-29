package com.wallet.clover.api.domain.statistics

import java.util.concurrent.atomic.LongAdder

data class Statistics(
    val dateCounter: Map<Int, Map<Int, LongAdder>>,
    val monthCounter: Map<Int, Map<Int, LongAdder>>,
    val oddEvenCounter: Map<String, Map<Int, LongAdder>>,
)
