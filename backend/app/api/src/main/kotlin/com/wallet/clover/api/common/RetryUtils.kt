package com.wallet.clover.api.common

import kotlinx.coroutines.delay
import org.slf4j.LoggerFactory
import java.io.IOException

private val logger = LoggerFactory.getLogger("RetryUtils")

suspend fun <T> retry(
    times: Int = 3,
    initialDelay: Long = 1000L,
    factor: Double = 2.0,
    block: suspend () -> T
): T {
    var currentDelay = initialDelay
    repeat(times - 1) {
        try {
            return block()
        } catch (e: Exception) {
            // 가능한 경우 IOException 또는 유사한 일시적 오류에 대해서만 재시도해야 하지만,
            // 여기서는 단순화를 위해 모든 예외에 대해 재시도합니다.
            // (GET 요청은 일반적으로 멱등성이 있다고 가정)
            logger.warn("작업 실패, ${currentDelay}ms 후 재시도합니다. 오류: ${e.message}")
            delay(currentDelay)
            currentDelay = (currentDelay * factor).toLong()
        }
    }
    return block() // 마지막 시도
}
