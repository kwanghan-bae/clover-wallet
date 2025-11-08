package com.wallet.clover.domain.recommendation

import com.wallet.clover.domain.recommendationsource.RecommendationRatio
import com.wallet.clover.domain.user.User
import org.slf4j.LoggerFactory
import java.security.SecureRandom

object NumberSelector {
    private val logger = LoggerFactory.getLogger(javaClass)

    private fun selectByText(source: String): List<Int> {
        val bucket = mutableSetOf<Int>()
        do {
            bucket.add(SecureRandom(source.toByteArray()).nextInt(44) + 1)
        } while (bucket.size != 6)

        return bucket.sorted()
    }

    private fun selectRandom(): List<Int> {
        val bucket = mutableSetOf<Int>()
        do {
            bucket.add(SecureRandom().nextInt(44) + 1)
        } while (bucket.size != 6)

        return bucket.sorted()
    }

    fun merge(source: List<Int>): List<Int> {
        return source
            .groupBy { it }
            .entries.asSequence()
            .sortedWith { o1, o2 -> o2.value.size.compareTo(o1.value.size) }
            .take(6)
            .onEach {
                logger.debug("{} , {} 회 반영", it.key, it.value.size)
            }.map { it.key }
            .toList()
    }

    fun select(ratio: RecommendationRatio, user: User): List<Int> {
        val source = mutableListOf<Int>()
        repeat(ratio.birthDayWeight) {
            user.birthDay?.toString()?.let { source += selectByText(it) }
        }
        repeat(ratio.customTextWeight) {
            user.customText?.let { source += selectByText(it) }
        }
        repeat(ratio.randomWeight) {
            source += selectRandom()
        }
        repeat(ratio.nameWeight) {
            user.name?.let { source += selectByText(it) }
        }
        repeat(ratio.dateWeight) {
            source += selectRandom()
        }
        repeat(ratio.monthWeight) {
            source += selectRandom()
        }
        repeat(ratio.oddAndEvenWeight) {
            source += selectRandom()
        }
        repeat(ratio.sumRangeWeight) {
            source += selectRandom()
        }
        repeat(ratio.previousGameWeight) {
            source += selectRandom()
        }
        return merge(source)
    }
}
