package com.wallet.clover.domain.recommendation

import com.wallet.clover.domain.recommendationsource.RecommendationRatio
import com.wallet.clover.domain.user.User
import java.security.SecureRandom
import java.time.LocalDate

object NumberSelector {
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
                println("${it.key} , ${it.value.size} 회 반영")
            }.map { it.key }
            .toList()
    }

    fun select(ratio: RecommendationRatio, user: User): List<Int> {
        val source = mutableListOf<Int>()
        repeat(ratio.birthDayWeight) {
            source += selectByText(user.birthDay.toString())
        }
        repeat(ratio.customTextWeight) {
            source += selectByText(user.customText.toString())
        }
        repeat(ratio.randomWeight) {
            source += selectRandom()
        }
        repeat(ratio.nameWeight) {
            source += selectByText(user.name.toString())
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

    /**
     * 또다른 재미요소
     * 1. 추첨일자별 많이 나오는 번호 반영
     * 2. 월별 많이 나오는 번호 반영
     * 3. 홀짝 회차별 많이 나오는 번호 반영
     * 4. 번호의 총합구간 별 확률 반영
     * 5. 지난 회차를 참조하여 연속해서 자주 나오는 번호 반영
     */
    @JvmStatic
    fun main(args: Array<String>) {
        println(merge(selectByText("hi")))

        select(
            ratio = RecommendationRatio(
                id = 0,
                userId = 0,
                randomWeight = 10,
                customTextWeight = 10,
                birthDayWeight = 10,
                nameWeight = 10,
                dateWeight = 10,
                monthWeight = 10,
                oddAndEvenWeight = 10,
                sumRangeWeight = 10,
                previousGameWeight = 10,
            ),
            user = User(
                id = 0,
                ssoQualifier = null,
                locale = null,
                age = null,
                customText = "true love",
                name = "joel.ship",
                birthDay = LocalDate.of(1989, 9, 11),
            ),
        )
    }
}
