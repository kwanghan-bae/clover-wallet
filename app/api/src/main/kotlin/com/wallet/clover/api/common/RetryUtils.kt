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
            // Only retry on IOExceptions or similar transient errors if possible, 
            // but for simplicity we retry on all exceptions here, 
            // assuming the block is idempotent (GET requests usually are).
            logger.warn("Operation failed, retrying in ${currentDelay}ms. Error: ${e.message}")
            delay(currentDelay)
            currentDelay = (currentDelay * factor).toLong()
        }
    }
    return block() // Last attempt
}
